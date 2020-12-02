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
                const portS = this.getPortSVG(POSITIONS.TOP)
                const portG = this.getPortSVG(POSITIONS.LEFT);

                portDContainer.append(portD);
                portBContainer.append(portB);
                portSContainer.append(portS);
                portGContainer.append(portG);


                portGContainer.attr(
                    'transform',
                    `translate(0, ${height / 2 - 5})`
                );


                portBContainer.attr(
                    'transform',
                    `translate(${width / 2 + 15}, ${height / 2 - 5})`
                );

                portSContainer.attr(
                    'transform',
                    `translate(${width / 2}, 0)`
                );

                portDContainer.attr(
                    'transform',
                    `translate(${width / 2}, ${height / 2 + 10})`
                );

                if (this.hostDesignerItem && childrenIds.length) {
                    const [connectorB, connectorD, connectorG, connectorS] = this._registerConnectors(childrenIds);
                    connectorG.css({
                        top: `${height / 2 - 5}px`,
                        left: `${width / 2 + 11}px`,
                    });
                    this._portPositions[childrenIds[2]] = {
                        x: width / 2 + 11,
                        y: height / 2 ,
                        orientation: POSITIONS.LEFT
                    };
                    connectorD.css({
                        top: `${height - 10}px`,
                        left: `${width + 12}px`,
                    });
                    this._portPositions[childrenIds[1]] = {
                        x: width + 12,
                        y: height - 10,
                        orientation: POSITIONS.BOTTOM
                    };

                    connectorB.css({
                        top: `${height / 2 - 5}px`,
                        left: `${width + 32}px`,
                    });

                    this._portPositions[childrenIds[0]] = {
                        y: height / 2,
                        x: width + 32,
                        orientation: POSITIONS.RIGHT
                    };

                    connectorS.css({
                        top: '0px',
                        left: `${width + 12}px`,
                    });

                    this._portPositions[childrenIds[3]] = {
                        y: 0,
                        x: width + 12,
                        orientation: POSITIONS.TOP
                    };
                }
            }
        }

    };

    FETs.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portPositions[id]) {
            return [{
                id: id,
                x1: this._portPositions[id].x + 5,
                x2: this._portPositions[id].x + 5,
                y1: this._portPositions[id].y,
                y2: this._portPositions[id].y,
                angle1: CONSTANTS.CONNECTION_ANGLES[this._portPositions[id].orientation] || 0,
                angle2: CONSTANTS.CONNECTION_ANGLES[this._portPositions[id].orientation] || 0
            }];
        } else {
            return [];
        }

    };

    return FETs;
});
