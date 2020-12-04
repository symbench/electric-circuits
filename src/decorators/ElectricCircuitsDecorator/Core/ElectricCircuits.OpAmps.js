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
    const OpAMP = function () {
    };

    OpAMP.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};
        if (node) {
            this.skinParts.$connectorContainer.empty();
            const childrenIDs = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            const portsContainer = svgIcon.find('.ports');
            for (let i = 1; i < 6; i++) {
                portsContainer.find(`.port-${i}`).empty();
            }
            if (portsContainer.length > 0) {
                const portLP = this.getPortSVG(POSITIONS.LEFT);
                const portLN = this.getPortSVG(POSITIONS.LEFT);
                const portVCC = this.getPortSVG(POSITIONS.TOP);
                const portGND = this.getPortSVG(POSITIONS.BOTTOM);
                const portOut = this.getPortSVG(POSITIONS.RIGHT);
                let connectors;
                if (this.hostDesignerItem && childrenIDs.length) {
                    connectors = this._registerConnectors(childrenIDs);
                }

                [portLP, portLN, portVCC, portGND, portOut].forEach((port, index) => {
                    const container = portsContainer.find(`.port-${index + 1}`);
                    let connector, childId;
                    if (connectors && connectors.length) {
                        connector = connectors[index];
                        childId = childrenIDs[index]
                    }
                    this._assignPortAndContainerPositions(
                        container,
                        index + 1,
                        connector,
                        childId
                    );
                    container.append(port);
                });
            }
        }
    };

    OpAMP.prototype._assignPortAndContainerPositions = function (container, index, connectorEl, childId) {
        const svgIcon = this.skinParts.$svg;
        const width = +svgIcon.attr('width');
        const height = +svgIcon.attr('height');
        let connectorCSS = {},
            portPosition = {};
        switch (index) {
            case 1:
                container.attr(
                    'transform',
                    `translate(5, ${height / 2 - 15})`
                );
                connectorCSS = {
                    left: `5px`,
                    top: `${height / 2 - 15}px`
                };
                portPosition = {
                    x: 5,
                    y: height / 2 - 10,
                    orientation: POSITIONS.LEFT
                };
                break;
            case 2:
                container.attr(
                    'transform',
                    `translate(5, ${height / 2 + 5})`
                )
                connectorCSS = {
                    left: `5px`,
                    top: `${height / 2 + 5}px`
                };
                portPosition = {
                    x: 5,
                    y: height / 2 + 10,
                    orientation: POSITIONS.LEFT
                };
                break;
            case 3:
                container.attr(
                    'transform',
                    `translate(${width / 2 - 5}, 15)`
                );
                connectorCSS = {
                    left: `${width / 2 - 5}px`,
                    top: '15px'
                };
                portPosition = {
                    x: width / 2,
                    y: 15,
                    orientation: POSITIONS.TOP
                };
                break;
            case 4:
                container.attr(
                    'transform',
                    `translate(${width / 2 - 5}, ${height / 2 + 5})`
                );
                connectorCSS = {
                    left: `${width / 2 - 5}px`,
                    top: `${height / 2 + 15}px`
                };
                portPosition = {
                    x: width / 2 ,
                    y: height / 2 + 20,
                    orientation: POSITIONS.BOTTOM
                };
                break;
            case 5:
                container.attr(
                    'transform',
                    `translate(${width / 2 + 20}, ${height / 2 - 5})`
                );
                connectorCSS = {
                    left: `${width / 2 + 25}px`,
                    top: `${height / 2 - 5}px`
                };
                portPosition = {
                    x: width / 2 + 25,
                    y: height / 2,
                    orientation: POSITIONS.RIGHT
                };
                break;

            default:
                break;
        }
        if (connectorEl) {
            connectorEl.css(connectorCSS);
        }
        if(childId) {
            this._portPositions[childId] = portPosition;
        }

    };

    OpAMP.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {

        if (this._portPositions[id]) {
            let angle = 0;
            switch (this._portPositions[id].orientation) {
                case POSITIONS.TOP:
                    angle = 270;
                    break;
                case POSITIONS.BOTTOM:
                    angle = 90;
                    break;
                case POSITIONS.LEFT:
                    angle = 180;
                    break;
                case POSITIONS.RIGHT:
                    angle = 0;
                    break;
            }
            return [{
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

    return OpAMP;
});
