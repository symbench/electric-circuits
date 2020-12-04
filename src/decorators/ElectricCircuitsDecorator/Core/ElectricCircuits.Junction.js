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
    'text!../Icons/JunctionPort.svg'
], function (
    ElectricCircuitMETA,
    CONSTANTS,
    JunctionPortSVGBase
) {
    const POSITIONS = CONSTANTS.POSITIONS;
    JunctionPortSVGBase = $(JunctionPortSVGBase);

    const Junction = function () {
    };

    Junction.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};

        if (node) {
            const childrenIDs = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            const width = +svgIcon.attr('width');
            const height = +svgIcon.attr('height');
            for (let i = 1; i < 5; i++) {
                svgIcon.find(`.port-${i}`).empty();
            }
            this._portsContainer = svgIcon.find('.ports');

            if (this._portsContainer.length) {
                const portFunc = this.getJunctionPortSVG;
                const positions = [POSITIONS.TOP, POSITIONS.BOTTOM, POSITIONS.LEFT, POSITIONS.RIGHT];
                const portT = portFunc(positions[0]);
                const portB = portFunc(positions[1]);
                const portL = portFunc(positions[2]);
                const portR = portFunc(positions[3]);


                const [
                    portsContainerT,
                    portsContainerB,
                    portsContainerL,
                    portsContainerR
                ] = this._getPortContainers(childrenIDs);

                portsContainerT[0].appendChild(portT[0]);
                portsContainerB[0].appendChild(portB[0]);
                portsContainerL[0].appendChild(portL[0]);
                portsContainerR[0].appendChild(portR[0]);
                if (this.hostDesignerItem && childrenIDs.length) {
                    const [
                        connectorT,
                        connectorB,
                        connectorL,
                        connectorR
                    ] = this._registerConnectors(childrenIDs);

                    connectorT.css({
                        'left': `${this._portPositions[childrenIDs[0]].x - CONSTANTS.JUNCTION_OFFSET}px`,
                        'top': `${this._portPositions[childrenIDs[0]].y - CONSTANTS.JUNCTION_OFFSET}px`
                    });

                    connectorB.css({
                        'left': `${this._portPositions[childrenIDs[1]].x - CONSTANTS.JUNCTION_OFFSET}px`,
                        'top': `${this._portPositions[childrenIDs[1]].y + CONSTANTS.JUNCTION_OFFSET}px`
                    });

                    connectorL.css({
                        'left': `${this._portPositions[childrenIDs[2]].x - CONSTANTS.JUNCTION_OFFSET}px`,
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

    Junction.prototype._getPortContainers = function (childrenIds) {
        const svgIcon = this.skinParts.$svg;
        const width = +svgIcon.attr('width');
        const height = +svgIcon.attr('height');
        const portsContainerT = this._portsContainer.find('.port-1');
        const portsContainerB = this._portsContainer.find('.port-2');
        const portsContainerL = this._portsContainer.find('.port-3');
        const portsContainerR = this._portsContainer.find('.port-4');

        portsContainerT.attr(
            'transform',
            `translate(${width / 2 - CONSTANTS.JUNCTION_OFFSET}, ${height / 4})`
        );

        this._portPositions[childrenIds[0]] = {
            x: width / 2,
            y: height / 4,
            orientation: POSITIONS.TOP
        }

        portsContainerB.attr(
            'transform',
            `translate(${width / 2 - CONSTANTS.JUNCTION_OFFSET}, ${height / 2})`
        );

        this._portPositions[childrenIds[1]] = {
            x: width / 2,
            y: height / 2,
            orientation: POSITIONS.BOTTOM
        }

        portsContainerL.attr(
            'transform',
            `translate(${width / 4}, ${height / 2 - CONSTANTS.JUNCTION_OFFSET})`
        );

        this._portPositions[childrenIds[2]] = {
            x: width / 4,
            y: height / 2,
            orientation: POSITIONS.LEFT
        };

        portsContainerR.attr(
            'transform',
            `
                    translate(${width / 2}, ${height / 2 - CONSTANTS.JUNCTION_OFFSET})`
        );

        this._portPositions[childrenIds[3]] = {
            x: width / 2,
            y: height / 2,
            orientation: POSITIONS.RIGHT
        };


        return [portsContainerT, portsContainerB, portsContainerL, portsContainerR];
    };

    Junction.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portPositions[id]) {
            const position = this._portPositions[id].orientation;
            let angle;
            if (position === POSITIONS.TOP) {
                angle = 270;
            } else if (position === POSITIONS.BOTTOM) {
                angle = 90;
            } else if (position === POSITIONS.LEFT) {
                angle = 180;
            } else if (position === POSITIONS.RIGHT) {
                angle = 0;
            }
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

    Junction.prototype.getJunctionPortSVG = function (position) {
        const svg = JunctionPortSVGBase.clone();
        switch (position) {
            case POSITIONS.TOP:
            case POSITIONS.BOTTOM:
                svg.find('.port').attr(
                    'transform',
                    'translate(10, 0) rotate(90)'
                )
                break;

            case POSITIONS.LEFT:
            case POSITIONS.RIGHT:
            default:
                break;
        }
        return svg;
    };

    Junction.prototype._renderMetaSpecificName = function () {
        if (this._displayConnectors) {
            this.skinParts.$name.remove();
        }
    };

    return Junction;
});
