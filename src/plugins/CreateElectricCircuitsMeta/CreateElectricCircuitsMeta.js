/*globals define*/
/*eslint-env node, browser*/

define([
    'electric-circuits/plugins/JSONImporter',
    'text!./metadata.json',
    'plugin/PluginBase',
    'electric-circuits/Constants',
    'common/util/guid',
    'text!./PySpice/elements.json'
], function (
    JSONImporter,
    pluginMetadata,
    PluginBase,
    Constants,
    generateGuid,
    PySpiceElements
) {
    'use strict';

    PySpiceElements = JSON.parse(PySpiceElements);
    pluginMetadata = JSON.parse(pluginMetadata);
    const MODELICA_ELECTRICAL_COMPONENTS_PREFIX = 'Modelica.Electrical.Analog';
    const MODELICA_PIN_ATTR_NAME = 'Pin';
    const DEFAULT_META_TAB = 'META';
    const DECORATOR_ID = 'ElectricCircuitsDecorator';
    const EXTRA_NODES = {
        SchottkyDiode: 'Diode',
        LED: 'Diode'
    };
    const EXTRA_TAB_NAMES = {
        SchottkyDiode: 'Semiconductors',
        LED: 'Semiconductors'
    };

    const EXTRA_ATTRIBUTES = {
        LED: {
            attributes: [{
                color: '#FF0000'
            }],
            attribute_meta:[{
                color: {
                    type: 'string',
                    description: 'The color of the LED'
                }
            }]
        }
    };

    const PYSPICE_CATEGORIES = {
        'Basic': 'high_level_elements'
    };

    class CreateElectricCircuitsMeta extends PluginBase {
        constructor(props) {
            super(props);
            this.metaSheets = {};
            this.sheetCounts = {};
            this.documentation = '';
            this.pluginMetadata = pluginMetadata;
        }

        async main(callback) {
            const importer = new JSONImporter(this.core, this.rootNode);
            const {electricalState, pin} = await this.getModelicaLibraryState(importer);
            this.modelicaState = electricalState;
            this.modelicaPinState = pin;
            const config = this.getCurrentConfig();
            this.core.removeLibrary(this.rootNode, 'Modelica');
            const state = await this.getBaseModel(importer);
            state.registry.validPlugins = state.registry.validPlugins.replace(this.getName(), '');
            state.registry.validDecorators = `${DECORATOR_ID} ${state.registry.validDecorators}`;

            const categories = this.getElectricalComponentCategories();
            this.createCategories(state, categories);

            categories.forEach(cat => {
                this.createModelicaNodesOfType(state, cat);
                this.createPySpiceNodesOfType(state, cat);
            });
            this.createExtraNodes(state);

            await importer.apply(this.rootNode, state);
            this.createDocumentationNode();
            if (config.updateBranch === false) {
                this.branchName = null;
            }
            const res = await this.save('Created ElectricCircuits Metamodel');

            if (config.updateBranch === false) {
                await this.project.createBranch('meta_' + Date.now(), res.hash);
            }

            this.result.setSuccess(true);
            callback(null, this.result);
        }

        async getBaseModel(importer) {
            const placeholder = name => ({id: `@name:${name}`});
            const language = {
                id: '@name:ElectricCircuits',
                children: [],
            };
            const root = await importer.toJSON(this.rootNode, true);

            this.language = language;

            this.metaSheets.META = this.createMetaSheetTab(root, 'META');

            root.children = [
                placeholder('FCO'),
                language
            ];

            const existingNodes = [
                'Circuit',
                'ComponentBase',
                'PortBase',
                'ConnectionBase',
                'Wire',
                'Pin',
                'ElectricCircuitsFolder',
                'Documentation',
                'Junction',
                'Voltage',
                'Current',
                'Basic',
                'Ground'
            ].map(name => {
                let node = placeholder(name);

                if (['Pin',
                    'Circuit',
                    'ElectricCircuitsFolder',
                    'Voltage',
                    'Junction',
                    'Current',
                    'Ground',
                ].includes(name)) {
                    node.registry = {
                        decorator: DECORATOR_ID,
                        isAbstract: false
                    };
                }
                return node;
            });

            this.addNodeToMeta(root, language);
            existingNodes.forEach(node => language.children.push(node));
            return root;
        }

        async getModelicaLibraryState(importer) {
            const modelicaRoot = this.core.getLibraryRoot(this.rootNode, 'Modelica');

            if (!modelicaRoot) {
                const err = 'Modelica is not installed as a library';
                this.logger.error(err);
                throw new Error(err);
            }

            const children = await this.core.loadChildren(modelicaRoot);

            const electricalRoot = children.find(node => {
                return this.core.getAttribute(node, 'name')
                    .startsWith(MODELICA_ELECTRICAL_COMPONENTS_PREFIX);
            });

            const pin = children.find(node => {
                return this.core.getAttribute(node, 'name') === MODELICA_PIN_ATTR_NAME;
            });

            return {
                electricalState: await importer.toJSON(electricalRoot, false),
                pin: await importer.toJSON(pin, false)
            };
        }

        createCategories(root) {
            const categories = this.getElectricalComponentCategories();
            categories.forEach(name => {
                this.metaSheets[name] = this.createMetaSheetTab(root, name);
                this.logger.debug(`Creating node category ${name}`);
                const node = this.createMetaNode(root, name, '@meta:ComponentBase', name);
                node.registry.isAbstract = true;
                node.registry.decorator = DECORATOR_ID;
            });
        }

        getElectricalComponentCategories() {
            return ['Basic', 'Semiconductors'];
        }

        createMetaSheetTab(root, name) {
            const sheets = root.registry[Constants.REGISTRY.META_SHEETS];
            let sheet = sheets.find(sheet => sheet.title === name);

            if (!sheet) {
                const id = Constants.META_ASPECT_SHEET_NAME_PREFIX + generateGuid();
                sheet = {
                    SetID: id,
                    order: sheets.length,
                    title: name
                };
                this.logger.debug(`Creating meta sheet "${name}"`);
                sheets.push(sheet);
                root.sets[id] = [];
                root.member_registry[id] = {};
            }
            return sheet.SetID;
        }

        addNodeToMeta(root, node, tabName = DEFAULT_META_TAB) {
            let tabId = this.metaSheets[tabName];
            let position = this.getNextPositionFor(tabName);

            if (!tabId) {
                const err = `No meta sheet for ${tabName}`;
                this.logger.error(err);
                throw new Error(err);
            }

            const nodeId = node.id;
            root.sets[Constants.META_ASPECT_SET_NAME].push(nodeId);
            root.sets[tabId].push(nodeId);

            const registry = {};

            registry[Constants.REGISTRY.POSITION] = position;
            root.member_registry[Constants.META_ASPECT_SET_NAME][nodeId] = registry;
            root.member_registry[tabId][nodeId] = registry;
            this.logger.debug(`added ${node.id} to the meta`);
        }

        getNextPositionFor(tabName) {
            let index = this.sheetCounts[tabName] || 0,
                position,
                dx = 250,
                dy = 160,
                MAX_WIDTH = 1200,
                x;

            this.sheetCounts[tabName] = index + 1;
            if (index === 0) {
                position = {
                    x: MAX_WIDTH / 2,
                    y: 50
                };
            } else {
                x = dx * index;
                position = {
                    x: x % MAX_WIDTH,
                    y: Math.floor(x / MAX_WIDTH + 1) * dy + 150
                };
            }
            return position;
        }

        createMetaNode(root, name, baseId, tabName) {
            tabName = tabName || DEFAULT_META_TAB;
            const node = {
                id: `@meta:${name}`,
                pointers: {base: baseId},
                attributes: {name},
                registry: {},
                attribute_meta: {},
                pointer_meta: {},
                sets: {},
                children: []
            };
            this.language.children.push(node);
            this.addNodeToMeta(root, node, tabName);
            return node;
        }

        createModelicaNodesOfType(root, category) {
            const nodes = this._getModelicaStateFor(category);
            nodes.forEach(node => {
                const base = `@meta:${category}`;
                // For now just create pure components with only Pins
                // This can be extended later
                // if (!node.children.every(child => this._isModelicaPin(child)) && category !== 'Semiconductors') {
                //     return;
                // }
                const categoryMetaNode = this.createMetaNode(root, node.attributes.ShortName, base, category);
                categoryMetaNode.registry.isAbstract = false;
                node.attributes.name = node.attributes.name.replace(
                    MODELICA_ELECTRICAL_COMPONENTS_PREFIX + `.${category}.`,
                    ''
                );
                node.children.forEach(child => {
                    if (this._isModelicaPin(child)) {
                        const pin = this._createPinNode(child.attributes.name);
                        categoryMetaNode.children.push(pin);
                    }
                });

                delete node.attribute_meta.ModelicaURI;
                delete node.attribute_meta.useHeatPort;
                delete node.attributes.ModelicaURI;
                delete node.attributes.ShortName;
                delete node.attributes.useHeatPort;
                categoryMetaNode.attributes = node.attributes;
                categoryMetaNode.attribute_meta = node.attribute_meta;
                this.addToDocumentation(categoryMetaNode);
            });
        }

        createPySpiceNodesOfType(root, category) {
            const components = this._getPySpiceStateFor(category);
            components.forEach(component => {
                const base = `@meta:${category}`;
                const metaNode = this.createMetaNode(root, component.name, base, category);
                this.logger.debug(`Created meta node of type ${component.name}`);
                metaNode.registry.isAbstract = false;
                component.attributes.forEach(attribute => {
                    metaNode.attributes[attribute.name] = attribute.default;
                    attribute.attribute_meta.type = this._inferAttributeType(attribute.default);
                    metaNode.attribute_meta[attribute.name] = attribute.attribute_meta;
                });

                const pinNames = ['p', 'n'];
                for(let j = 0; j < (component.pins_count || 0); j++) {
                    metaNode.children.push(
                        this._createPinNode(pinNames[j])
                    );
                }
                this.addToDocumentation(metaNode);
            });
        }

        addToDocumentation(metaNode) {
            let metaDoc = [
                `## ${metaNode.attributes.name}\n`,
                '### Attributes:\n',
            ];
            Object.entries(metaNode.attribute_meta).forEach(([name, attr]) => {
                metaDoc.push('---');
                metaDoc.push(`- Name: **${name}**`);
                metaDoc.push(`- Description: ${attr.description || attr.parameter || 'N/A'}`);
                metaDoc.push(`- Type: ${attr.type || 'N/A'}`);
                metaDoc.push(`- Unit: ${attr.unit || attr.units || 'N/A'}`);
                metaDoc.push(`- Default: ${metaNode.attributes[name] || 'N/A'}`);
                metaDoc.push('\n');
            });
            metaDoc.push('\n');
            this.documentation += metaDoc.join('\n');
        }

        createExtraNodes(root) {
            const electricCircuits = root.children.find(child => {
                return child.id === '@name:ElectricCircuits';
            });
            Object.entries(EXTRA_NODES).forEach(([k, v]) => {
                const node = electricCircuits.children.find(child => {
                    return child.id === `@meta:${v}`;
                });
                if (node) {
                    const newNode = this.createMetaNode(
                        root, k, `@meta:${v}`, EXTRA_TAB_NAMES[k]
                    );
                    if(EXTRA_ATTRIBUTES[k]) {
                        EXTRA_ATTRIBUTES[k].attributes
                            .forEach(attr => {
                                Object.entries(attr).forEach(([name, defaultValue]) => {
                                    newNode.attributes[name] = defaultValue;
                                });
                            });
                        EXTRA_ATTRIBUTES[k].attribute_meta
                            .forEach(attr => {
                                Object.entries(attr).forEach(([name, meta]) => {
                                    newNode.attribute_meta[name] = meta;
                                });
                            });
                    }
                }
            });
        }

        createDocumentationNode() {
            const docNode = this.core.createNode({
                parent: this.rootNode,
                base: this.META.Documentation
            });
            this.core.setAttribute(
                docNode,
                'documentation',
                this.documentation
            );
        }

        _isModelicaPin(state) {
            return state.pointers.base === this.modelicaPinState.path;
        }

        _getModelicaStateFor(type) {
            return this.modelicaState.children.filter(node => {
                return node.attributes.name.startsWith(MODELICA_ELECTRICAL_COMPONENTS_PREFIX + `.${type}`);
            });
        }

        _getPySpiceStateFor(type) {
            const typeKey = PYSPICE_CATEGORIES[type];
            return PySpiceElements[typeKey] || [];
        }

        _inferAttributeType(value) {
            if (typeof value === 'number'){
                return 'float';
            } else if (typeof value === 'boolean') {
                return 'boolean';
            } else {
                return 'string';
            }
        }

        _createPinNode(name) {
            return {
                id: `@name:${name}`,
                pointers: {base: '@meta:Pin'}
            };
        }

    }

    return CreateElectricCircuitsMeta;
});
