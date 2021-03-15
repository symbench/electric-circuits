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
    './ElectricCircuits.Constants',
], function (
    ElectricCircuitMETA,
    CONSTANTS,
) {
    const POSITIONS = CONSTANTS.POSITIONS;

    const Junction = function () {
    };

    Junction.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};

        if (node) {
            const childrenIDs = this.getSortedPinIds(node);
            this._calculatePortPositions(childrenIDs);

            if (Object.keys(this._portPositions).length) {

                if (this.hostDesignerItem && childrenIDs.length) {
                    const [
                        connectorT,
                        connectorB,
                        connectorL,
                        connectorR
                    ] = this._registerConnectors(childrenIDs);

                    connectorT.css({
                        'left': `${this._portPositions[childrenIDs[0]].x - CONSTANTS.JUNCTION_OFFSET}px`,
                        'top': `${this._portPositions[childrenIDs[0]].y - 2 * CONSTANTS.JUNCTION_OFFSET}px`
                    });

                    connectorB.css({
                        'left': `${this._portPositions[childrenIDs[1]].x - CONSTANTS.JUNCTION_OFFSET}px`,
                        'top': `${this._portPositions[childrenIDs[1]].y + CONSTANTS.JUNCTION_OFFSET}px`
                    });

                    connectorL.css({
                        'left': `${this._portPositions[childrenIDs[2]].x - 2 * CONSTANTS.JUNCTION_OFFSET}px`,
                        'top': `${this._portPositions[childrenIDs[2]].y - CONSTANTS.JUNCTION_OFFSET}px`
                    });

                    connectorR.css({
                        'left': `${this._portPositions[childrenIDs[3]].x + CONSTANTS.JUNCTION_OFFSET}px`,
                        'top': `${this._portPositions[childrenIDs[3]].y - CONSTANTS.JUNCTION_OFFSET}px`
                    });
                }
            }
        }
    };

    Junction.prototype._calculatePortPositions = function (childrenIds) {
        const svgIcon = this.skinParts.$svg;
        const width = +svgIcon.attr('width');
        const height = +svgIcon.attr('height');

        this._portPositions[childrenIds[0]] = {
            x: width / 2,
            y: height / 4 + CONSTANTS.JUNCTION_OFFSET,
            orientation: POSITIONS.TOP
        };


        this._portPositions[childrenIds[1]] = {
            x: width / 2,
            y: height / 2,
            orientation: POSITIONS.BOTTOM
        };

        this._portPositions[childrenIds[2]] = {
            x: width / 4 + CONSTANTS.JUNCTION_OFFSET,
            y: height / 2,
            orientation: POSITIONS.LEFT
        };

        this._portPositions[childrenIds[3]] = {
            x: width / 2,
            y: height / 2,
            orientation: POSITIONS.RIGHT
        };
    };

    Junction.prototype.getConnectionAreas = function (id, /*isEnd, connectionMetaInfo*/) {
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

    Junction.prototype._renderMetaSpecificName = function () {
        if (this._displayConnectors) {
            this.skinParts.$name.remove();
        }
    };

    return Junction;
});
