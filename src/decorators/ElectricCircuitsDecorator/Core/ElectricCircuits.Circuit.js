/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/* globals define *, $ */
/* eslint-env browser */

define([
    './ElectricCircuits.META',
    './ElectricCircuits.Constants',
    './Utils',
    'text!../Icons/Name.svg'
], function (
    ElectricCircuitsMETA,
    CONSTANTS,
    DecoratorUtils,
    NameSVGBase,
) {
    NameSVGBase = $(NameSVGBase);
    const Circuit = function () {
    };

    Circuit.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        const svgIcon = this.skinParts.$svg;
        const pins = this.planPins(node);
        if (pins) {
            const portsContainer = svgIcon.find('.ports');
            const namesContainer = svgIcon.find('.pin-names');
            portsContainer.empty();
            namesContainer.empty();
            pins.forEach(([port, name]) => {
                portsContainer.append(port);
                namesContainer.append(name);
            });
        }
    };

    Circuit.prototype.planPins = function (circuitNode) {
        const client = this._control._client;
        const childrenIds = circuitNode.getChildrenIds();
        const pins = childrenIds
            .filter(childID => ElectricCircuitsMETA.TYPE_INFO.isPin(childID))
            .map(childId => client.getNode(childId)).sort();
        this._portPositions = {};
        if (pins.length) {
            const svgIcon = this.skinParts.$svg;
            const height = +svgIcon.attr('height');
            let lCount = 1, rCount = 1;
            const portWidth = 12;
            return pins.map((pin, index) => {
                const port = this.getPortSVG(index % 2 === 0 ? CONSTANTS.POSITIONS.LEFT : CONSTANTS.POSITIONS.RIGHT).find('.port');
                let xShift = 0, yShift = 0;
                if (index % 2 === 0) {
                    xShift = 25;
                    yShift = lCount % 2 === 0 ? height / 2 - lCount * 10 : height / 2 + lCount * 10;
                    port.attr(
                        'transform',
                        `translate(${xShift - 20}, ${yShift + 2})`
                    );
                    this._portPositions[pin.getId()] = {
                        x: xShift + 2,
                        y: yShift + 2,
                        orientation: CONSTANTS.POSITIONS.LEFT
                    };
                    lCount++
                } else {
                    xShift = 55;
                    yShift = rCount % 2 === 0 ? height / 2 - rCount * 10 : height / 2 + rCount * 10;
                    port.attr(
                        'transform',
                        `translate(${xShift + 40}, ${yShift + 12}) rotate(180)`
                    );
                    this._portPositions[pin.getId()] = {
                        x: xShift + 40 + portWidth,
                        y: yShift + 2,
                        orientation: CONSTANTS.POSITIONS.RIGHT
                    };
                    rCount++
                }


                const name = pin.getAttribute('name');
                const nameContainer = NameSVGBase.clone().find('.name-container');
                nameContainer.find('.name').text(DecoratorUtils.getAbbrName(name));
                nameContainer.attr(
                    'transform',
                    `translate(${xShift}, ${yShift})`
                );
                const [connector] = this._registerConnectors([pin.getId()]);
                if (connector) {
                    connector.css({
                        top: `${this._portPositions[pin.getId()].y}px`,
                        left: `${this._portPositions[pin.getId()].x}px`,
                    });
                }
                return [port, nameContainer];
            });
        }

    };

    Circuit.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portPositions[id]) {
            const angle = this._portPositions[id].orientation === CONSTANTS.POSITIONS.LEFT ? 180 : 0;
            return [{
                x1: this._portPositions[id].x + 0.5,
                x2: this._portPositions[id].x + 0.5,
                y1: this._portPositions[id].y + 0.5 + 3,
                y2: this._portPositions[id].y + 0.5 + 3,
                angle1: angle,
                angle2: angle,
                len: 5
            }];
        } else {
            return [];
        }
    };

    return Circuit;
});
