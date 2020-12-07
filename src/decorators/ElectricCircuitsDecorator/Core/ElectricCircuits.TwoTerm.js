/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/* globals define, $ */
/* eslint-env browser */
define([
    './ElectricCircuits.META',
    './ElectricCircuits.Constants'
], function (
    ElectricCircuitsMETA,
    CONSTANTS
) {
    const POSITIONS = CONSTANTS.POSITIONS;
    const VALID_TWO_TERM_ATTRS = [
        'R',
        'C',
        'L',
        'G'
    ];

    const SHOULD_DISPLAY_ATTR_NODES = [
        'Resistor',
        'Capacitor',
        'Inductor',
        'Conductor'
    ];

    const DISPLAY_UNITS = {
        'Ohm': '\u03A9',
        'F': 'F',
        'H': 'H',
        'S': '\u2127'
    };

    const TwoTerminalComponent = function () {};

    TwoTerminalComponent.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};
        if (node) {
            const isVertical = ElectricCircuitsMETA.TYPE_INFO.isVertical(node.getId());
            const isPotentiometer = ElectricCircuitsMETA.TYPE_INFO.isPotentiometer(node.getId());
            const childrenIDs = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            svgIcon.find('.port-p').empty();
            svgIcon.find('.port-n').empty();
            if (isPotentiometer) {
                svgIcon.find('.port-out').empty();
            }
            if (ElectricCircuitsMETA.TYPE_INFO.isLED(node.getId())) {
                svgIcon.find('.fill-color').attr(
                    'fill',
                    node.getAttribute('color')
                );
            }
            this.skinParts.$connectorContainer.empty();
            const portsContainer = svgIcon.find('.ports');

            if (portsContainer.length > 0) {
                let portOut, portContainerOut;
                const portLT = this.getPortSVG(isVertical ? POSITIONS.TOP : POSITIONS.LEFT);
                const portRB = this.getPortSVG(isVertical ? POSITIONS.BOTTOM : POSITIONS.RIGHT);

                const portContainerLT = portsContainer.find('.port-p');
                const portContainerRB = portsContainer.find('.port-n');
                const width = +svgIcon.attr('width');
                const height = +svgIcon.attr('height');

                if (isPotentiometer) {
                    portOut = this.getPortSVG(POSITIONS.TOP);
                    portContainerOut = portsContainer.find('.port-out');
                }

                let translateP,
                    translateN,
                    translateOut,
                    portHeight,
                    connectorETCSS,
                    connectorWBCSS,
                    connectorOutCSS;

                if (isVertical) {
                    portHeight = +portRB.attr('height');
                    translateP = `translate(${(width / 2) - CONSTANTS.TWO_TERM_OFFSET}, 5)`;
                    translateN = `translate(${(width / 2) - CONSTANTS.TWO_TERM_OFFSET}, ${height - portHeight - 5})`;
                    connectorETCSS = {
                        top: '5px',
                        left: `${width / 2 - CONSTANTS.TWO_TERM_OFFSET}px`
                    };
                    connectorWBCSS = {
                        top: `${height - 3 * CONSTANTS.TWO_TERM_OFFSET}px`,
                        left: `${width / 2 - CONSTANTS.TWO_TERM_OFFSET}px`
                    };

                    this._portPositions[childrenIDs[0]] = {
                        x: width / 2,
                        y: 5,
                        orientation: POSITIONS.TOP
                    };
                    this._portPositions[childrenIDs[1]] = {
                        x: width / 2,
                        y: height - 5,
                        orientation: POSITIONS.BOTTOM
                    };
                } else {
                    translateP = `translate(5, ${(height / 2) - CONSTANTS.TWO_TERM_OFFSET})`;
                    translateN = `translate(${width - 20}, ${(height / 2) - CONSTANTS.TWO_TERM_OFFSET})`;
                    connectorETCSS = {
                        top: `${(height / 2) - CONSTANTS.TWO_TERM_OFFSET}px`,
                        left: '5px'
                    };
                    connectorWBCSS = {
                        top: `${(height / 2) - CONSTANTS.TWO_TERM_OFFSET}px`,
                        left: `${width - 15}px`
                    };
                    this._portPositions[childrenIDs[0]] = {
                        x: 5,
                        y: height / 2,
                        orientation: POSITIONS.LEFT
                    };
                    this._portPositions[childrenIDs[1]] = {
                        x: width - 10,
                        y: height / 2,
                        orientation: POSITIONS.RIGHT
                    };
                    if (isPotentiometer) {
                        translateOut = `translate(${width / 2 - CONSTANTS.TWO_TERM_OFFSET}, 0)`;
                        connectorOutCSS = {
                            top: '0px',
                            left: `${width / 2 - CONSTANTS.TWO_TERM_OFFSET}px`
                        };
                        this._portPositions[childrenIDs[2]] = {
                            x: width / 2,
                            y: 0,
                            orientation: POSITIONS.TOP
                        };
                    }
                }
                portContainerLT.attr(
                    'transform',
                    translateP
                );
                portContainerRB.attr(
                    'transform',
                    translateN
                );

                portContainerLT[0].appendChild(portLT[0]);
                portContainerRB[0].appendChild(portRB[0]);
                if (isPotentiometer) {
                    portContainerOut.attr('transform', translateOut);
                    portContainerOut[0].appendChild(portOut[0]);
                }

                if (this.hostDesignerItem && childrenIDs.length) {
                    let connectorET, connectorWB, connectorOut;
                    if (isPotentiometer) {
                        [connectorET, connectorWB, connectorOut] = this._registerConnectors(childrenIDs);
                        connectorOut.css(connectorOutCSS);
                    } else {
                        [connectorET, connectorWB] = this._registerConnectors(childrenIDs);
                    }

                    connectorET.css(connectorETCSS);
                    connectorWB.css(connectorWBCSS);
                }
            }
        }
    };

    TwoTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portPositions[id]) {
            const angle = CONSTANTS.CONNECTION_ANGLES[this._portPositions[id].orientation];
            return [{
                id: id,
                x1: this._portPositions[id].x,
                x2: this._portPositions[id].x,
                y1: this._portPositions[id].y,
                y2: this._portPositions[id].y,
                angle1: angle,
                angle2: angle,
                len: 5
            }];
        } else {
            return [];
        }
    };

    TwoTerminalComponent.prototype._renderMetaSpecificName = function () {
        const node = this.getCurrentNode();
        const metaType = ElectricCircuitsMETA.getMetaTypeOf(node.getId());

        if (this._displayConnectors && SHOULD_DISPLAY_ATTR_NODES.includes(metaType)) {
            node.getValidAttributeNames().forEach(attr => {
                if (VALID_TWO_TERM_ATTRS.includes(attr)) {
                    const name = node.getAttribute('name');
                    const value = node.getAttribute(attr);
                    let unit = node.getAttributeMeta(attr).unit;
                    unit = DISPLAY_UNITS[unit] || unit;
                    const attrContainer = $(`<div class='units'>${value} ${unit}</div>`);
                    attrContainer.click(() => {
                        attrContainer.text(value);
                        attrContainer.editInPlace({
                            css: {
                                'z-index': 1000
                            },
                            onChange: (oldVal, newVal) => {
                                if (oldVal !== newVal && !isNaN(parseFloat(newVal))) {
                                    this.onAttributeChange(node.getId(), attr, parseFloat(newVal));
                                }
                            },
                            onFinish: () => {
                                attrContainer.text(`${node.getAttribute(attr)} ${unit}`);
                            }
                        });
                    });
                    this.skinParts.$name.append(attrContainer);
                }
            });
        }
    };

    TwoTerminalComponent.prototype.onAttributeChange = function (id, attr, newValue) {
        const client = this._control._client;
        const node = client.getNode(id);
        const name = node.getAttribute('name');
        const oldValue = node.getAttribute(attr);
        const fromMsg = oldValue ? ` (from ${oldValue})` : '';
        const msg = `Set ${name}'s ${attr} to ${newValue}${fromMsg}`;
        client.startTransaction(msg);
        client.setAttribute(id, attr, newValue);
        client.completeTransaction();
    }

    return TwoTerminalComponent;
});
