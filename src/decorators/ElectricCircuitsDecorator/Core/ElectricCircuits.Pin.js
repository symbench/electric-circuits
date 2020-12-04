/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/* globals define */
/* eslint-env browser */
define([
    './ElectricCircuits.META',
    './ElectricCircuits.Constants'
], function (
    ElectricCircuitsMETA,
    CONSTANTS
) {
    const POSITIONS = CONSTANTS.POSITIONS
    const Pin = function () {
    };

    Pin.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        const svgIcon = this.skinParts.$svg;
        const width = +svgIcon.attr('width');
        const height = +svgIcon.attr('height');
        if (node) {
            const id = node.getId();
            let connectors = this._registerConnectors(Array(4).fill(id));
            svgIcon.find('.pin-name').text(node.getAttribute('name'));
            this._connectionAreas = [];
            let x, y;
            if (connectors) {
                const positions = [
                    POSITIONS.TOP,
                    POSITIONS.LEFT,
                    POSITIONS.BOTTOM,
                    POSITIONS.RIGHT
                ];
                connectors.forEach((conn, index) => {
                    if (index % 2 === 0) {
                        conn.css({
                            top: `${index === 0 ? 5 : height - 15}px`,
                            left: `${width / 2 - 5}px`
                        });
                        y = index === 0 ? 10 : height - 10;
                        x = width / 2;
                    } else {
                        conn.css({
                            top: `${height / 2 - 5}px`,
                            left: index - 1 === 0 ? 5 : width - 15,
                        });
                        y = height / 2;
                        x = index - 1 === 0 ? 9 : width - 10;
                    }

                    this._connectionAreas.push({
                        x: x,
                        y: y,
                        angle: CONSTANTS.CONNECTION_ANGLES[positions[index]],
                        len: 5
                    });
                });
            }
        }

    };

    Pin.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        return this._connectionAreas.map((area, index) => {
            return {
                id: index,
                x1: area.x,
                x2: area.x,
                y1: area.y,
                y2: area.y,
                angle1: area.angle,
                angle2: area.angle,
                len: area.len
            };
        });
    };

    Pin.prototype._renderMetaSpecificName = function () {
        if (this._displayConnectors) {
            this.skinParts.$name.remove();
        }
    };

    return Pin;
});
