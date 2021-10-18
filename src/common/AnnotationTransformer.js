/*globals define*/
function factory() {
    let VALID_BASE = 'ComponentBase';
    const ANNOTATION_META_COMPONENT_BASE = 'Component';
    const ANNOTATION_META_PORT_BASE = 'Port';
    const ANNOTATION_META_TEXTUAL_ATTRIBUTE_BASE = 'Textual';
    const ANNOTATION_META_NUMERIC_ATTRIBUTE_BASE = 'Numeric';

    const WEBGME_NUMERIC_TYPES =  {
        FLOAT: 'float',
        INTEGER: 'int',
    }
    // const ANNOTATION_META_SHEET_NAME = 'Circuit Components';
    function translateToAnnotationMeta(nodeSchema) {
        assert(isLanguageContainer(nodeSchema), 'Expected language container but found: ' + JSON.stringify(nodeSchema));
        const metaNodes = nodeSchema.children;
        // TODO: get all nodes that inherit from ComponentBase and are not abstract
        const components = getComponents(metaNodes);
        const language = {};
        language.children = components.flatMap(transformToAnnotations);
        return language;
    }

    function getComponents(nodes) {
        const basePath = findByName(nodes, VALID_BASE);
        return nodes.filter((node, _, records) => inheritsFrom(node, basePath, records));
    }

    function transformToAnnotations(node) {
        const component = transformNode(node, ANNOTATION_META_COMPONENT_BASE);
        const ports = transformPorts(node);
        if(ports.length) {
            assignValidChildren(component, ports, 0, 1);
        }

        const attributes = transformAttributes(node);
        if(attributes.length){
            assignValidChildren(component, attributes, 0, 1);
        }

        return [component, ...ports, ...attributes];
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
           if (node.attribute_meta[name]) {
               switch (node.attribute_meta[name].type) {
                   case WEBGME_NUMERIC_TYPES.FLOAT:
                   case WEBGME_NUMERIC_TYPES.INTEGER:
                       base = ANNOTATION_META_NUMERIC_ATTRIBUTE_BASE;
                       break;
                   default:
                       base = ANNOTATION_META_TEXTUAL_ATTRIBUTE_BASE;
               }
           }

           const attributeNode = {
               id: `@name:${node.attributes.name}`,
               attributes: {
                   value: value
               },
               pointers: {
                   base: `@meta:${base}`
               }
           };

           if (base === ANNOTATION_META_NUMERIC_ATTRIBUTE_BASE) {
               attributeNode.attributes.unit = node.attribute_meta[name] ? node.attribute_meta[name].unit : '';
           }

           return attributeNode;
       });
   }

    function transformPorts(node) {
        return node.children.map(child => {
            return transformNode(child, ANNOTATION_META_PORT_BASE);
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
