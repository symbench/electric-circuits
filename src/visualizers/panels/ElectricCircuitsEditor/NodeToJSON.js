/* globals define */

define([
    'js/Utils/GMEConcepts'
], function (
    GMEConcepts
){
    class NodeToJSON {
        constructor(client) {
            this.client = client;
            this._initialize();
        }

        _initialize() {
            this.META = {};
            this.META_NAMES = {};
            this.client.getAllMetaNodes().forEach(node => {
                this.META[node.getId()] = node;
                this.META_NAMES[node.getAttribute('name')] = node;
            });
        }

        apply(nodeId) {
            const node = this.client.getNode(nodeId);
            const json = {};
            if (node) {
                if (this.isPin(node) && !this.isCircuit(this.client.getNode(node.getParentId()))) {
                    return ;
                }
                json.id = node.getId();
                json.name = node.getAttribute('name');
                json.type = this.META[node.getMetaTypeId()].getAttribute('name');
                json.ports = [];
                node.getChildrenIds()
                    .map(id => this.client.getNode(id))
                    .filter(child => this.isPin(child)).forEach(child => {
                        json.ports.push({
                            id: child.getId(),
                            name: child.getAttribute('name')
                        });
                    });
                json.attrs = {};
                node.getValidAttributeNames().forEach(name => {
                    json.attrs[name] = node.getAttribute(name);
                });
                json.links = {};
                if(GMEConcepts.isConnection(nodeId)) {
                    const src = this.client.getNode(node.getPointerId('src'));
                    const dst = this.client.getNode(node.getPointerId('dst'));
                    const srcParentId = src.getParentId();
                    const dstParentId = dst.getParentId();
                    json.links.src = {
                        id: src.getId(),
                        name: src.getAttribute('name'),
                        parentId: srcParentId
                    };
                    json.links.dst = {
                        id: dst.getId(),
                        name: dst.getAttribute('name'),
                        parentId: dstParentId
                    };
                    const arr = [src, dst];
                    arr.forEach((pin, index) => {
                        if (this.isPin(pin) && this.isCircuit(this.client.getNode(pin.getParentId()))){
                            delete json.links[['src', 'dst'][index]].parentId;
                        }
                    });
                }
            }
            return json;
        }

        isPin(node) {
            if(node){
                return this.META[node.getMetaTypeId()] === this.META_NAMES['Pin'];
            }
        }

        isCircuit(node) {
            return this.META[node.getMetaTypeId()] === this.META_NAMES['Circuit'];
        }
    }

    return NodeToJSON;
});
