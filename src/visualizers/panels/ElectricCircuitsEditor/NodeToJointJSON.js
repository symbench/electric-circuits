/* globals define */

define([], function () {
    const DOMAIN_PREFIX = 'circuit';

    class NodesToJointJSON {
        constructor(client) {
            this.client = client;
            this._initializeMETA();
        }

        _initializeMETA() {
            this.META = {};
            this.META_NAMES = {};
            this.client.getAllMetaNodes().forEach(node => {
                this.META[node.getId()] = node;
                this.META_NAMES[node.getAttribute('name')] = node.getId();
            });

            Object.entries(this.META_NAMES).forEach(([name, nodeId]) => {
                const node = this.META[nodeId];

                // MetaChildren are not loaded. Temporary hack
                if (node.isTypeOf(this.META_NAMES['Basic']) || node.isTypeOf(this.META_NAMES['Semiconductors'])) {
                    const pinIds = node.getChildrenIds();

                    if (pinIds.length === 2) {
                        this[name] = this.twoPinComponent;
                    } else if (pinIds.length === 3) {
                        this[name] = this.threePinComponent;
                    }
                }
            });
        }

        toJointJSON(nodeId) {
            const node = this.client.getNode(nodeId);
            const type = this.getMetaName(node);
            const jointJSON = {
                domainPrefix: DOMAIN_PREFIX,
                type: type,
                id: node.getId(),
                attrs:{
                    text: {
                        text: node.getAttribute('name')
                    }
                }
            };

            if(this[type]) {
                this[type](node, jointJSON);
                return jointJSON;
            } else {
                return null;
            }
        }

        Wire(node, json) {
            delete json.attrs.text;
            return json;
        }

        Circuit(node, json) {
            json.ports = {
                items: []
            };

            const pins = this.getPins(node);

            let height = 100;

            if (pins.length > 10) {
                height += ((pins.length % 2 === 0 ? pins.length : pins.length + 1) - 10) * 20;
            }

            json.size = {
                height: height
            };

            pins.forEach((pin, index) => {
                json.ports.items.push({
                    group: index %2 === 0 ? 'leftPorts': 'rightPorts',
                    id: pin.getId(),
                    attrs: {
                        text: {text: pin.getAttribute('name')},
                        circle: {
                            port: pin.getId()
                        }
                    },
                });
            });

            return json;
        }

        twoPinComponent(node, json) {
            const pins = this.getPins(node);

            pins.forEach((pin) => {
                json.attrs[`.pin${pin.getAttribute('name')}`] = {
                    port: pin.getId()
                };
            });

            return json;
        }

        threePinComponent(node, json) {
            const pins = this.getPins(node);

            const pinsMap = {};
            pins.forEach(pin => {
                pinsMap[pin.getAttribute('name')] = pin.getId()
            });

            console.log(node.getAttribute('name'));

            if (this.isNPN(node) || this.isPNP(node)) {
                json.attrs['.pin1'] = { port: pins[this.isNPN(node) ? 'C' : 'E'] };
                json.attrs['.pin2'] = { port: pins['B'] };
                json.attrs['.pin3'] = { port: pins[this.isPNP(node) ? 'C' : 'E'] };
            } else if (this.isPotentiometer(node)) {
                json.attrs['.pin1'] = { port: pins['pin_p'] };
                json.attrs['.pin2'] = { port: pins['pin_n'] };
                json.attrs['.pin3'] = { port: pins['contact'] };
            }
        }

        getPins(node) {
            return node.getChildrenIds()
                .filter(id => this.isPin(id))
                .map(pinId => this.client.getNode(pinId));
        }

        isPin (nodeId) {
            return this.client.isTypeOf(nodeId, this.META_NAMES['Pin']);
        }

        getMetaName (node) {
            return this.META[node.getMetaTypeId()].getAttribute('name');
        }

        isPotentiometer (node) {
            return node.isTypeOf(this.META_NAMES['Potentiometer']);
        }

        isNPN (node) {
            return node.isTypeOf(this.META_NAMES['NPN']);
        }

        isPNP (node) {
            return node.isTypeOf(this.META_NAMES['PNP']);
        }
    }

    return NodesToJointJSON;
});
