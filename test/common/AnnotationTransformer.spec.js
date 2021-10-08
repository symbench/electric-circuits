/*eslint-env node, mocha*/

describe.only('AnnotationMetaTransformer', function () {
    const path = require('path');
    const fs = require('fs');
    const assert = require('assert');
    const transform = require('../../src/common/AnnotationTransformer');

    let nodeSchema, annotationSchema;

    before(function () {
        const filepath = path.resolve(__dirname, 'ElectricCircuitsLang.json');
        nodeSchema = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        annotationSchema = transform(nodeSchema);
        fs.writeFileSync(path.resolve(__dirname, 'AnnotationsLanguage.json'), JSON.stringify(annotationSchema, null, 2));
    });

    it('should make components instances of @meta:Component', function () {
        nodeSchema.children.forEach(child => {
            const annoNode = findByName(annotationSchema, child.attributes.name);
            if(annoNode) {
                assert(annoNode.pointers.base === '@meta:Component');
            }
        });
    });

    it('should make textual attribute instances of @meta:Attribute', function () {
        nodeSchema.children.forEach(child => {
            Object.keys(child.attributes).forEach(attr => {
                const annoNode = findByName(annotationSchema, attr);
                if(annoNode) {
                    assert(['@meta:Textual', '@meta:Numeric'].includes(annoNode.pointers.base));
                }
            });
        });
    });

    it('should make attributes valid children of component', function () {

    });

    it('should make attributes children multiplicity 0/1', function () {
    });

    it('should make children instances of @meta:Port', function () {
    });

    it('should make children valid children in new metamodel', function () {
    });

    function findByName(nodes, name) {
        return nodes.children.find(node => node.id === `@meta:${name}`);
    }
});
