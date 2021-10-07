/*globals define*/
function factory() {
    function translateToAnnotationMeta(nodeSchema) {
        assert(isLanguageContainer(nodeSchema), 'Expected language container but found: ' + JSON.stringify(nodeSchema));
        const metaNodes = nodeSchema.children;
        // TODO: get all nodes that inherit from ComponentBase and are not abstract
        const componentNodes = metaNodes;
        // TODO: get all attribute metas
        // TODO: get all children
        const schemas = componentNodes.map(node => this.createComponentSchema(node));
    }

    function isLanguageContainer(nodeSchema) {
        const fcoTags = ['@meta:FCO', '/1'];
        return fcoTags.includes(nodeSchema.pointers.base) && nodeSchema.children.length;
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
