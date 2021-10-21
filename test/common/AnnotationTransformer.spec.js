/*eslint-env node, mocha*/

describe('AnnotationMetaTransformer', function () {
    const _ = require('lodash');
    const path = require('path');
    const fs = require('fs');
    const assert = require('assert');
    const transform = require('../../src/common/AnnotationTransformer');

    let nodeSchema, annotationSchema;

    before(function () {
        const filepath = path.resolve(__dirname, 'ElectricCircuitsLang.json');
        nodeSchema = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        annotationSchema = transform(nodeSchema);
    });

    it('should make components instances of @meta:Component', function () {
        nodeSchema.children.forEach(child => {
            const annoNode = findByName(annotationSchema, child.attributes.name);
            if(annoNode) {
                assert(annoNode.pointers.base === '@meta:Component');
            }
        });
    });

    it('should make attribute instances of @meta:Attribute', function () {
        nodeSchema.children.forEach(child => {
            Object.keys(child.attributes).forEach(attr => {
                const annoNodes = findAllOfName(annotationSchema, attr);
                if(annoNodes.length) {
                    assert(
                        annoNodes.some(annoNode => ['@meta:Textual', '@meta:Numeric'].includes(annoNode.pointers.base)),
                        `${attr} inherits from ${annoNodes[0].pointers.base} instead of attribute type`
                    );
                }
            });
        });
    });

    it('should make attributes valid children of component', function () {
        const annotationNames = annotationSchema.children.map(node => node.id.replace(/@.*:/, ''));
        nodeSchema.children.forEach(schema => {
            if(annotationNames.includes(schema.attributes.name)) {
                Object.keys(schema.attributes).forEach(attr => {
                    assert(findByName(annotationSchema, attr), `Could not find ${attr}`);
                });
            }
        });
    });

    it('should make attributes children multiplicity 0/1', function () {
        const annoComponents = annotationSchema.children.filter(node => node.pointers.base === '@meta:Component');
        annoComponents.forEach(component => {
            assert(Object.values(component.children_meta)
                .every(cardinality => cardinality.min === 0 && cardinality.max === 1));
        });
    });

    it('should make children instances of @meta:Port', function () {
        const pinsPath = findByName(nodeSchema, 'Pin').path;
        nodeSchema.children.forEach(node => {
            const portNames = node.children.filter(node => {
                return node.pointers.base === pinsPath;
            }).map(pin => pin.attributes.name);

            const annoPorts = portNames.flatMap(name => findAllOfName(annotationSchema, name))
                .filter(child => child.pointers.base === '@meta:Port');
            annoPorts.every(port => portNames.includes(port.id.replace(/@.*:/, '')));
        });
    });

    it('should find same attributes for LED and Diode', function () {
        const diode = findByName(annotationSchema, 'Diode');
        const led  = findByName(annotationSchema, 'LED');
        assert(led.children_meta['@meta:color']);
        delete led.children_meta['@meta:color'];

        Object.keys(diode.children_meta).forEach(meta => {
            const ledAttribute = led.children_meta[meta];
            const diodeAttribute = diode.children_meta[meta];
            if(diodeAttribute) {
                assert.equal(diodeAttribute.min, ledAttribute.min);
                assert.equal(diodeAttribute.max, ledAttribute.max);
            }
        });
    });

    it('should not contain colliding names', function () {
        const nodesByName = _.groupBy(annotationSchema.children, node => node.attributes.name);
        const duplicates = Object.values(nodesByName).filter(nodes => nodes.length > 1);
        // Ports *shouldn't* be a problem but they also shouldn't be top level...
        assert.equal(duplicates.length, 0, `Found name collisions:\n\t${prettyPrintDuplicates(duplicates).replace(/\n/gm, '\n\t')}`);

        function prettyPrintDuplicates(duplicates) {
            return duplicates.map(nodes => {
                const {name} = nodes[0].attributes;
                const types = nodes.map(n => n.pointers.base);
                return `${name}: ${types.join(', ')}`;
            }).join('\n');
        }
    });

    function findByName(language, name) {
        return language.children.find(node => node.attributes.name === name);
    }

    function findAllOfName(language, name){
        return language.children.filter(node => node.attributes.name === name);
    }

    describe('deepEquals', function() {
        const {deepEquals} = transform;

        it('should return true w/ identical lists', function() {
            assert(deepEquals([1,2,3], [1,2,3]));
        });

        it('should return false w/ shorter lists', function() {
            assert(!deepEquals([1,2], [1,2,3]));
        });

        it('should return true w/ identical objects', function() {
            assert(deepEquals({a: 1, b:2}, {a: 1, b:2}));
        });

        it('should return false w/ different sized objects', function() {
            assert(!deepEquals({a: 1}, {a: 1, b:2}));
        });

        it('should return false w/ different objects', function() {
            assert(!deepEquals({a: 1}, {a: 3}));
        });

        it('should return true w/ list item', function() {
            assert(deepEquals({a: [1, 2]}, {a: [1, 2]}));
        });
    });
});
