/* globals define */

define([], function () {
    const DOMAIN_PREFIX = 'circuit';

    class JointControl {
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
                    } else if (name === 'CCC' || name === 'CCV' || pinIds.length === 4) {
                        this[name] = this.fourPinComponent;
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
                attrs: {
                    text: {
                        text: node.getAttribute('name')
                    }
                },
                gmeAttrs: {}
            };

            if (this[type]) {
                this[type](node, jointJSON);
                this.addGMEAttrs(node, jointJSON);
                return jointJSON;
            } else {
                return null;
            }
        }

        Wire(node, json) {
            const srcId = node.getPointerId('src');
            const dstId = node.getPointerId('dst');
            const src = this.client.getNode(srcId);
            const dst = this.client.getNode(dstId);
            const srcParentId = src.getParentId();
            const dstParentId = dst.getParentId();

            delete json.attrs.text;

            json.source = {
                id: this.isCircuit(srcParentId) && !this.isSubCircuit(srcParentId) ? srcId : srcParentId,
                port: this.isCircuit(srcParentId) && !this.isSubCircuit(srcParentId) ? '' : srcId
            };

            json.target = {
                id: this.isCircuit(dstParentId) && !this.isSubCircuit(dstParentId) ? dstId : dstParentId,
                port: this.isCircuit(dstParentId) && !this.isSubCircuit(dstParentId) ? '' : dstId
            };

            json.router = {
                name: 'manhattan'
            };
        }

        Ground(node, json) {
            const pin = this.getPins(node).pop();
            json.attrs['.pin'] = {
                port: pin.getId()
            };
        }

        Pin(/*node, json*/) {

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
                    group: index % 2 === 0 ? 'leftPorts' : 'rightPorts',
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

        OpAmp(node, json) {
            const pins = this.getPins(node);
            const pinsMap = this.pinNamesToId(pins);

            let pinsOrder = [];
            if (this.isOpAMP(node)) {
                pinsOrder = ['VMax', 'VMin', 'in_p', 'in_n', 'out'];
            } else if (this.isOpAmpDetailed(node)) {
                pinsOrder = ['p_supply', 'm_supply', 'p', 'm', 'outp'];
            }

            pinsOrder.forEach((pin, index) => {
                json.attrs[`.pin${index + 1}`] = {port: pinsMap[pin]};
            });
        }

        OpAmpDetailed(node, json) {
            this.OpAmp(node, json);
        }

        twoPinComponent(node, json) {
            const pins = this.getPins(node);

            pins.forEach((pin) => {
                json.attrs[`.pin${pin.getAttribute('name')}`] = {
                    port: pin.getId()
                };
            });
        }

        threePinComponent(node, json) {
            const pins = this.getPins(node);
            const pinsMap = this.pinNamesToId(pins);

            if (this.isNPN(node) || this.isPNP(node)) {
                json.attrs['.pin1'] = {port: pinsMap[this.isNPN(node) ? 'C' : 'E']};
                json.attrs['.pin2'] = {port: pinsMap['B']};
                json.attrs['.pin3'] = {port: pinsMap[this.isPNP(node) ? 'C' : 'E']};
            } else if (this.isPotentiometer(node)) {
                json.attrs['.pin1'] = {port: pinsMap['pin_p']};
                json.attrs['.pin2'] = {port: pinsMap['pin_n']};
                json.attrs['.pin3'] = {port: pinsMap['contact']};
            }
        }

        fourPinComponent(node, json) {
            const pins = this.getPins(node);
            const pinsMap = this.pinNamesToId(pins);

            if (this.isJunction(node)) {
                delete json.attrs.text;
                Object.keys(pinsMap).forEach((pinName, index) => {
                    json.attrs[`.pin${index + 1}`] = {port: pinsMap[`p${index + 1}`]};
                });
            } else {
                let pinsOrder = [];

                if (this.isMOS(node)) {
                    pinsOrder = ['D', 'G', 'B', 'S'];
                } else if (this.isFourPinGenericComponent(node)) {
                    pinsOrder = ['p1', 'n1', 'p2', 'n2'];
                }

                pinsOrder.forEach((pin, index) => {
                    json.attrs[`.pin${index + 1}`] = {port: pinsMap[pin]};
                });
            }
        }

        addGMEAttrs(node, json) {
            json.gmeAttrs = {};
            node.getValidAttributeNames().forEach(attr => {
                json.gmeAttrs[attr] = node.getAttribute(attr);
            });
        }

        getPins(node) {
            return node.getChildrenIds()
                .filter(id => this.isPin(id))
                .map(pinId => this.client.getNode(pinId))
                .sort((pin1, pin2) => {
                    const pin1Name = pin1.getAttribute('name').toUpperCase();
                    const pin2Name = pin2.getAttribute('name').toUpperCase();
                    if (pin1Name < pin2Name) {
                        return -1;
                    }

                    if (pin1Name > pin2Name) {
                        return 1;
                    }

                    return 0;
                });
        }

        isPin(nodeId) {
            return this.client.isTypeOf(nodeId, this.META_NAMES['Pin']);
        }

        getMetaName(node) {
            return this.META[node.getMetaTypeId()].getAttribute('name');
        }

        isPotentiometer(node) {
            return node.isTypeOf(this.META_NAMES['Potentiometer']);
        }

        isCircuit(nodeId) {
            return this.client.isTypeOf(nodeId, this.META_NAMES['Circuit']);
        }

        isSubCircuit(nodeId) {
            const node = this.client.getNode(nodeId);

            if (node) {
                return this.isCircuit(node.getId()) && this.isCircuit(node.getParentId());
            }
        }

        isCircuitPin(pinId) {
            if (this.isPin(pinId)) {
                const pin = this.client.getNode(pinId);
                return this.isCircuit(pin.getParentId()) && !this.isSubCircuit(pin.getParentId());
            }
        }

        isInsideSubCircuit(nodeId) {
            if(!this.isPin(nodeId)) {
                const node = this.client.getNode(nodeId);
                return this.isSubCircuit(node.getParentId());
            }
        }

        isNPN(node) {
            return node.isTypeOf(this.META_NAMES['NPN']);
        }

        isPNP(node) {
            return node.isTypeOf(this.META_NAMES['PNP']);
        }

        isJunction(node) {
            return node.isTypeOf(this.META_NAMES['Junction']);
        }

        isMOS(node) {
            return node.isTypeOf(this.META_NAMES['NMOS']) || node.isTypeOf(this.META_NAMES['PMOS']);
        }

        isFourPinGenericComponent(node) {
            return node.isTypeOf(this.META_NAMES['CCC']) ||
                node.isTypeOf(this.META_NAMES['CCV']) ||
                node.isTypeOf(this.META_NAMES['VCC']) ||
                node.isTypeOf(this.META_NAMES['VCV']) ||
                node.isTypeOf(this.META_NAMES['Gyrator']) ||
                node.isTypeOf(this.META_NAMES['Transformer']);
        }

        isOpAMP(node) {
            return node.isTypeOf(this.META_NAMES['OpAmp']);
        }

        isOpAmpDetailed(node) {
            return node.isTypeOf(this.META_NAMES['OpAmpDetailed']);
        }

        isInsideCCSource(nodeId) {
            const node = this.client.getNode(nodeId);
            if (this.client.isTypeOf(node.getParentId(), this.META_NAMES['CCC'])
                    || this.client.isTypeOf(node.getParentId(), this.META_NAMES['CCV'])) {
                return true;
            }
        }

        pinNamesToId(pins) {
            const pinNamesToId = {};

            pins.forEach(pin => {
                pinNamesToId[pin.getAttribute('name')] = pin.getId();
            });

            return pinNamesToId;
        }
    }

    return JointControl;
});
