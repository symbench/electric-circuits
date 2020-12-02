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
    CONSTANTS,
) {
    const ThreeTerminalComponent = function () {
    };
    const POSITIONS = CONSTANTS.POSITIONS;

    ThreeTerminalComponent.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};
        if (node) {
            const childrenIds = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            svgIcon.find('.port').empty();

            this._portsContainer = svgIcon.find('.ports');

            if (this._portsContainer.length > 0) {
                const width = +svgIcon.attr('width');
                const height = +svgIcon.attr('height');
                const portL = this.getPortSVG(POSITIONS.LEFT);
                const portTV = this.getPortSVG(POSITIONS.TOP);
                const portBV = this.getPortSVG(POSITIONS.BOTTOM);

                const [portContainerL, portContainerTV, portContainerBV] = this._getPortContainers();
                portContainerL.attr(
                    'transform',
                    `translate(0, ${height / 2 - CONSTANTS.THREE_TERM_OFFSET})`
                );

                portContainerTV.attr(
                    'transform',
                    `translate(${width / 2}, 0)`
                );

                portContainerBV.attr(
                    'transform',
                    `translate(${width / 2}, ${height / 2 + 2 * CONSTANTS.THREE_TERM_OFFSET})`
                );
                portContainerL[0].appendChild(portL[0]);
                portContainerTV[0].appendChild(portTV[0]);
                portContainerBV[0].appendChild(portBV[0]);
                if (this.hostDesignerItem && childrenIds.length) {
                    const [connectorL, connectorTV, connectorBV] = this._registerConnectors(childrenIds);

                    connectorL.css({
                        'top': `${height / 2 - CONSTANTS.THREE_TERM_OFFSET}px`,
                        'left': `${width / 2 + 2 * CONSTANTS.THREE_TERM_OFFSET + 2}px`
                    });
                    this._portPositions[childrenIds[0]] = {
                        x: width / 2 +  2 * CONSTANTS.THREE_TERM_OFFSET,
                        y: height / 2,
                        orientation: POSITIONS.LEFT
                    }

                    connectorTV.css({
                        'left': `${width + 2 * CONSTANTS.THREE_TERM_OFFSET + 2}px`,
                        'top': '0px'
                    });

                    this._portPositions[childrenIds[1]] = {
                        x: width +  2 * CONSTANTS.THREE_TERM_OFFSET + 6,
                        y: 0,
                        orientation: POSITIONS.TOP
                    };

                    connectorBV.css({
                        'left': `${width + 2 * CONSTANTS.THREE_TERM_OFFSET + 2}px`,
                        'top': `${height - 2 * CONSTANTS.THREE_TERM_OFFSET}px`
                    });

                    this._portPositions[childrenIds[2]] = {
                        x: width +  2 * CONSTANTS.THREE_TERM_OFFSET + 6,
                        y: height - 2 * CONSTANTS.THREE_TERM_OFFSET,
                        orientation: POSITIONS.BOTTOM
                    };
                }
            }
        }
    };

    ThreeTerminalComponent.prototype._getPortContainers = function () {
        const portContainerL = this._portsContainer.find('.port-1');
        const portContainerTV = this._portsContainer.find('.port-2');
        const portContainerBV = this._portsContainer.find('.port-3');

        return [portContainerL, portContainerTV, portContainerBV];
    }


    ThreeTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portPositions[id]) {
            let x, y, angle;
            const position = this._portPositions[id].orientation;
            if (position === POSITIONS.LEFT) {
                x = 35;
                y = 41;
                angle = 180;
            } else if (position === POSITIONS.TOP) {
                x = 80;
                y = 0;
                angle = 270;
            } else if (position === POSITIONS.BOTTOM) {
                x = 80;
                y = 75;
                angle = 90;
            } else {
                x = 0;
                y = 0;
                angle = 180;
            }

            return [{
                'id': id,
                'x1': this._portPositions[id].x,
                'x2': this._portPositions[id].x,
                'y1': this._portPositions[id].y,
                'y2': this._portPositions[id].y,
                'angle1': angle,
                'angle2': angle,
                'len': 5
            }];
        } else {
            return [];
        }
    };


    return ThreeTerminalComponent;
});
