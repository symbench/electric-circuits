/*globals define*/
function factory() {
    const ELECTRIC_CIRCUITS_COMPONENT_BASE = 'ComponentBase';
    const ELECTRIC_CIRCUITS_PORT_BASE = 'Pin';
    const ANNOTATION_META_COMPONENT_BASE = 'Component';
    const ANNOTATION_META_PORT_BASE = 'Port';
    const ANNOTATION_META_TEXTUAL_ATTRIBUTE_BASE = 'Textual';
    const ANNOTATION_META_NUMERIC_ATTRIBUTE_BASE = 'Numeric';
    const WEBGME_NUMERIC_TYPES =  ['float', 'integer'];

    function translateToAnnotationMeta(nodeSchema) {
        assert(isLanguageContainer(nodeSchema), 'Expected language container but found: ' + JSON.stringify(nodeSchema));
        const components = getNonAbstractChildrenOfType(nodeSchema, ELECTRIC_CIRCUITS_COMPONENT_BASE);
        const language = {};

        const allAnnotations = components.flatMap((component) => {
            return transformToAnnotations(component, nodeSchema);
        });
        language.children = onlyUnique(allAnnotations);
        return language;
    }

    function onlyUnique(annotations) {
        const uniques = [];
        annotations.forEach(annotation => {
            const exists = uniques
                .find(unique => unique.id === annotation.id && unique.pointers.base === annotation.pointers.base);
            if (!exists) {
                uniques.push(annotation);
            }
        });
        return uniques;
    }

    function getNonAbstractChildrenOfType(schema, type) {
        const baseNode = findByName(schema.children, type);
        return schema.children.filter((node, _, records) => {
            return inheritsFrom(node, baseNode, records) && !node.registry.isAbstract;
        });
    }

    function transformToAnnotations(node, schema) {
        const componentBase = findByName(schema.children, ELECTRIC_CIRCUITS_COMPONENT_BASE);
        addIntermediateProperties(node, componentBase, schema);

        const component = transformNode(node, ANNOTATION_META_COMPONENT_BASE);
        const ports = transformPorts(node, schema);

        if(ports.length) {
            assignValidChildren(component, ports, 0, 1);
        }

        const attributes = transformAttributes(node);
        if(attributes.length){
            assignValidChildren(component, attributes, 0, 1);
        }

        return [component, ...ports, ...attributes];
    }

    function addIntermediateProperties(node, topParent, schema) {
        let parentNode = findByPath(schema.children, node.pointers.base);
        while(parentNode.id !== topParent.id) {
            copyAttributes(parentNode, node);

            node.children.forEach(child => {
                const childInParent = parentNode.children.find(parentChild => child.pointers.base === parentChild.path);
                if(childInParent) {
                    child.pointers.base = childInParent.pointers.base;
                    copyAttributes(childInParent, child);
                }
            });

            parentNode = findByPath(schema.children, parentNode.pointers.base);
        }
    }

    function copyAttributes(from, to) {
        Object.entries(from.attributes).forEach(([key, value]) => {
            if (!to.attributes[key]) {
                to.attributes[key] = value;
            }
        });

        Object.entries(from.attribute_meta).forEach(([key, value]) => {
            if (!from.attribute_meta[key]) {
                to.attribute_meta[key] = value;
            }
        });
    }

    function transformNode(node, base) {
        return {
            id: `@name:${node.attributes.name}`,
            attributes: {
                name: node.attributes.name
            },
            pointers: {
                base: `@meta:${base}`
            }
        };
    }

    function assignValidChildren(node, children, min=-1, max=-1) {
        children.forEach(child => {
            node.children_meta = node.children_meta || {};
            node.children_meta[`@meta:${child.attributes.name}`] = {min, max};
        });
    }

    function transformAttributes(node) {
        let base;
        return Object.entries(node.attributes).map(([name, value]) => {
            base = ANNOTATION_META_TEXTUAL_ATTRIBUTE_BASE;
            if (node.attribute_meta[name]) {
                if (WEBGME_NUMERIC_TYPES.includes(node.attribute_meta[name].type)) {
                    base = ANNOTATION_META_NUMERIC_ATTRIBUTE_BASE;
                }
            }
            let attributes = {
                name: name,
                value: value,
            };

            const attributeNode = {
                id: `@name:${name}`,
                attributes: attributes,
                pointers: {
                    base: `@meta:${base}`
                }
            };

            if (base === ANNOTATION_META_NUMERIC_ATTRIBUTE_BASE) {
                attributeNode.attributes.unit = node.attribute_meta[name] ? node.attribute_meta[name].unit : '';
            }

            attributeNode.attributes.description = node.attribute_meta[name] ? node.attribute_meta[name].description : '';
            return attributeNode;
        });
    }

    function getPorts(node, schema) {
        const portBase = findByName(schema.children, ELECTRIC_CIRCUITS_PORT_BASE);
        const ports = node.children.filter(child => inheritsFrom(child, portBase, schema.children));
        ports.forEach(port => addIntermediateProperties(port, portBase, schema));

        return ports;
    }

    function transformPorts(node, schema) {
        return getPorts(node, schema)
            .map(port => {
                return transformNode(port, ANNOTATION_META_PORT_BASE);
            });
    }


    function inheritsFrom(node, base, nodes) {
        const nodeBase = node.pointers.base;
        if( nodeBase === base.path ) {
            return true;
        } else {
            const parent = findByPath(nodes, nodeBase);
            if(parent && !isLanguageContainer(parent)) {
                return inheritsFrom(parent, base, nodes);
            } else {
                return false;
            }
        }
    }

    function isLanguageContainer(nodeSchema) {
        const fcoTags = ['@meta:FCO', '/1'];
        return fcoTags.includes(nodeSchema.pointers.base) && nodeSchema.children.length;
    }

    function findByName(nodes, name) {
        return nodes.find(node => node.attributes.name === name);
    }

    function findByPath(nodes, path) {
        return nodes.find(node => node.path === path);
    }

    function assert(cond, errMsg='Assertion Failed') {
        if (!cond) {
            throw new Error(errMsg);
        }
    }

    return translateToAnnotationMeta;
}

if (typeof define !== 'undefined') {
    define([], factory);
} else {
    module.exports = factory();
}
