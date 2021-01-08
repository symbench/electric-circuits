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
    const POSITIONS = CONSTANTS.POSITIONS;
    const FETs = function () {
    };

    FETs.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};
        if (node) {
            const childrenIds = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            const width = +svgIcon.attr('width');
            const height = +svgIcon.attr('height');
            const portsContainer = svgIcon.find('.ports');
            if (portsContainer.length) {
                const portDContainer = svgIcon.find('.port-1');
                const portBContainer = svgIcon.find('.port-2');
                const portSContainer = svgIcon.find('.port-3');
                const portGContainer = svgIcon.find('.port-4');
                portDContainer.empty();
                portBContainer.empty();
                portSContainer.empty();
                portGContainer.empty();
                const portD = this.getPortSVG(POSITIONS.BOTTOM);
                const portB = this.getPortSVG(POSITIONS.RIGHT);
                const portS = this.getPortSVG(POSITIONS.TOP);
                const portG = this.getPortSVG(POSITIONS.LEFT);

                portDContainer.append(portD);
                portBContainer.append(portB);
                portSContainer.append(portS);
                portGContainer.append(portG);


                portGContainer.attr(
                    'transform',
                    `translate(5, ${height / 2 - 5})`
                );


                portBContainer.attr(
                    'transform',
                    `translate(${width / 2 + 20}, ${height / 2 - 5})`
                );

                portSContainer.attr(
                    'transform',
                    `translate(${width / 2 + 5}, 5)`
                );

                portDContainer.attr(
                    'transform',
                    `translate(${width / 2 + 5} , ${height / 2 + 15})`
                );

                if (this.hostDesignerItem && childrenIds.length) {
                    const [connectorB, connectorD, connectorG, connectorS] = this._registerConnectors(childrenIds);
                    connectorG.css({
                        top: `${height / 2 - 5}px`,
                        left: '5px',
                    });
                    this._portPositions[childrenIds[2]] = {
                        x: 5,
                        y: height / 2,
                        orientation: POSITIONS.LEFT
                    };
                    connectorD.css({
                        top: `${height / 2 + 25}px`,
                        left: `${width / 2 + 5}px`,
                    });
                    this._portPositions[childrenIds[1]] = {
                        x: width / 2 + 10,
                        y: height /2 + 30,
                        orientation: POSITIONS.BOTTOM
                    };

                    connectorB.css({
                        top: `${height / 2 - 5}px`,
                        left: `${width / 2 + 25}px`,
                    });

                    this._portPositions[childrenIds[0]] = {
                        y: height / 2,
                        x: width / 2 + 25,
                        orientation: POSITIONS.RIGHT
                    };

                    connectorS.css({
                        top: '5px',
                        left: `${width / 2 + 5}px`,
                    });

                    this._portPositions[childrenIds[3]] = {
                        y: 5,
                        x: width / 2 + 10,
                        orientation: POSITIONS.TOP
                    };
                }
            }
        }

    };

    FETs.prototype.getConnectionAreas = function (id, /*isEnd, connectionMetaInfo*/) {
        if (this._portPositions[id]) {
            return [{
                id: id,
                x1: this._portPositions[id].x,
                x2: this._portPositions[id].x,
                y1: this._portPositions[id].y,
                y2: this._portPositions[id].y,
                angle1: CONSTANTS.CONNECTION_ANGLES[this._portPositions[id].orientation] || 0,
                angle2: CONSTANTS.CONNECTION_ANGLES[this._portPositions[id].orientation] || 0,
                len: 5
            }];
        } else {
            return [];
        }

    };

    return FETs;
});
