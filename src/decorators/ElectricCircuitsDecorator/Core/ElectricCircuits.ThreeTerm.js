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
        this._portOrientations = {};
        if (node) {
            const childrenIds = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            svgIcon.find('.port').empty();

            this._portsContainer = svgIcon.find('.ports');

            if (this._portsContainer.length > 0) {
                const portL = this.getPortSVG(POSITIONS.LEFT);
                const portTV = this.getPortSVG(POSITIONS.TOP);
                const portBV = this.getPortSVG(POSITIONS.BOTTOM);

                const [portContainerL, portContainerTV, portContainerBV] = this._getPortContainers();

                portContainerL[0].appendChild(portL[0]);
                portContainerTV[0].appendChild(portTV[0]);
                portContainerBV[0].appendChild(portBV[0]);
                if (this.hostDesignerItem && childrenIds.length) {
                    const [connectorL, connectorTV, connectorBV] = this._registerConnectors(childrenIds);

                    [POSITIONS.LEFT, POSITIONS.TOP, POSITIONS.BOTTOM]
                        .forEach((pos, index) => {
                            this._portOrientations[childrenIds[index]] = {
                                position: pos
                            };
                        });

                    connectorL.css({
                        'top': '37px',
                        'left': '36px'
                    });

                    connectorTV.css({
                        'left': '76px',
                        'top': '2px'
                    });

                    connectorBV.css({
                        'left': '76px',
                        'top': '72px'
                    });
                }
            }
        }
    };

    ThreeTerminalComponent.prototype._getPortContainers = function () {
        const portContainerL = this._portsContainer.find('.port-1');
        const portContainerTV = this._portsContainer.find('.port-2');
        const portContainerBV = this._portsContainer.find('.port-3');

        portContainerL.attr(
            'transform',
            CONSTANTS.TRANSFORMS.CONTAINER_THREE_TERM_L
        );

        portContainerTV.attr(
            'transform',
            CONSTANTS.TRANSFORMS.CONTAINER_THREE_TERM_T_V
        );

        portContainerBV.attr(
            'transform',
            CONSTANTS.TRANSFORMS.CONTAINER_THREE_TERM_B_V
        );

        return [portContainerL, portContainerTV, portContainerBV];
    }


    ThreeTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portOrientations[id]) {
            let x, y, angle;
            const position = this._portOrientations[id].position;
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
                'x1': x,
                'x2': x,
                'y1': y,
                'y2': y,
                'angle1': angle,
                'angle2': angle,
                'length': 5
            }];
        } else {
            return [];
        }
    };


    return ThreeTerminalComponent;
});
