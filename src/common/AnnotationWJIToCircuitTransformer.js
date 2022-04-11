/* globals define */
function factory(guid) {
    class AnnotationWJIToCircuitTransformer {
        transform(annotationsWJI) {
            this._transformIntersections(annotationsWJI);
            this._addPortToJunctions(annotationsWJI);
            this._reassignJunctionEdges(annotationsWJI);
        }

        _transformIntersections(annotations) {
            // Nodes
            const intersections = annotations.children.filter(this._isIntersection);
            intersections.forEach(intersection => {
                intersection.id ? intersection.id = intersection.id.replace('Intersection', 'Junction'): null;
                intersection.pointers.base = '@meta:Junction';
            });

            // Edges/Wires
            const wires = annotations.children.filter(this._isWire);
            wires.forEach(wire => {
                wire.id ?  wire.id = wire.id.replace('Intersection', 'Junction'): null;
                wire.pointers.src = wire.pointers.src.replace('Intersection', 'Junction');
                wire.pointers.dst = wire.pointers.dst.replace('Intersection', 'Junction');
            });
        }

        _addPortToJunctions(annotations) {
            const junctions = annotations.children.filter(this._isJunction);
            junctions.forEach(junction => {
                junction.children = this._getPortsWJI(
                    ['p1', 'p2', 'p3', 'p4']
                );
            });
        }

        _reassignJunctionEdges(annotations) {
            const junctions = Object.fromEntries(annotations.children.filter(this._isJunction).map(j => [j.id, j]));
            const wires = annotations.children.filter(this._isWire);

            const isAJunctionId = id => !!junctions[id];

            const getRandomChild = node => {
                const index = Math.floor(Math.random() * node.children.length);
                return node.children[index];
            };

            wires.forEach(wire => {
                if (isAJunctionId(wire.pointers.src)) {
                    wire.pointers.src = `@id:${getRandomChild(junctions[wire.pointers.src]).alias}`;
                }

                if (isAJunctionId(wire.pointers.dst)) {
                    wire.pointers.dst = `@id:${getRandomChild(junctions[wire.pointers.dst]).alias}`;
                }
            });
        }

        _isIntersection(node) {
            return node.pointers.base === '@meta:Intersection';
        }

        _isJunction(node) {
            return node.pointers.base === '@meta:Junction';
        }

        _isWire(node) {
            return node.pointers.base === '@meta:Wire';
        }

        _getPortsWJI(portNames) {
            return portNames.map(name => {
                const id = `${guid()}`;
                const attributes = {name};
                const pointers = {base: "@meta:Pin"};
                return {
                    alias: id,
                    id: `@name:${name}`,
                    attributes,
                    pointers
                };
            });
        }
    }

    return AnnotationWJIToCircuitTransformer;
}


if (typeof define !== 'undefined') {
    define(['common/util/guid'], (guid) => factory(guid));
} else {
    module.exports = factory();
}


