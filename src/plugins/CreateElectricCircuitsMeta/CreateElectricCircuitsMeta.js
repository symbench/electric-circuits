/*globals define*/
/*eslint-env node, browser*/

define([
    'electric-circuits/plugins/JSONImporter',
    'text!./metadata.json',
    'plugin/PluginBase',
    'electric-circuits/Constants',
    'common/util/guid'
], function (
    JSONImporter,
    pluginMetadata,
    PluginBase,
    Constants,
    generateGuid,
) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);
    const MODELICA_ELECTRICAL_COMPONENTS_PREFIX = 'Modelica.Electrical.Analog';
    const MODELICA_PIN_ATTR_NAME = 'Pin';
    const DEFAULT_META_TAB = 'META';

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

            const categories = this.getElectricalComponentCategories();
            this.createCategories(state, categories);
            categories.forEach(cat => this.createNodesOfType(state, cat));

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
                'Documentation'
            ];

            this.addNodeToMeta(root, language);
            existingNodes.forEach(name => language.children.push(placeholder(name)));
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
                dx = 140,
                dy = 100,
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
                    y: Math.floor(x / MAX_WIDTH + 1) * dy + 50
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

        createNodesOfType(root, category) {
            const nodes = this._getModelicaStateFor(category);
            nodes.forEach(node => {
                const base = `@meta:${category}`;
                // For now just create pure components with only Pins
                // This can be extended later
                if (!node.children.every(child => this._isModelicaPin(child)) && category !== 'Semiconductors') {
                    return;
                }
                const categoryMetaNode = this.createMetaNode(root, node.attributes.ShortName, base, category);
                categoryMetaNode.registry.isAbstract = false;
                node.attributes.name = node.attributes.name.replace(
                    MODELICA_ELECTRICAL_COMPONENTS_PREFIX + `.${category}.`,
                    ''
                );
                node.children.forEach(child => {
                    if (this._isModelicaPin(child)) {
                        const target = {
                            id: `@name:${child.attributes.name}`,
                            pointers: {base: '@meta:Pin'}
                        };
                        categoryMetaNode.children.push(target);
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

        addToDocumentation(metaNode) {
            let metaDoc = [
                `##${metaNode.attributes.name}`,
                '### Attributes:',
            ];
            Object.entries(metaNode.attribute_meta).forEach(([name, attr]) => {
                metaDoc.push(`- name: **${name}**`);
                metaDoc.push(`- description: ${attr.description}`);
                metaDoc.push(`- Type: ${attr.type}`);
                metaDoc.push(`- Unit: ${attr.unit}`);
                metaDoc.push(`- Default: ${metaNode.attributes[name] || 'N/A'}`);
                metaDoc.push('\n');
            });
            metaDoc.push('\n');
            this.documentation += metaDoc.join('\n');
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

    }

    return CreateElectricCircuitsMeta;
});