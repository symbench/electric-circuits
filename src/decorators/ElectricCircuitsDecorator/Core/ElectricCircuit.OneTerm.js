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
    const OneTerminalComponent = function () {
    };

    OneTerminalComponent.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};
        if (node) {
            const childrenIds = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            const width = +svgIcon.attr('width');
            svgIcon.find('.port').empty();
            const portsContainer = svgIcon.find('.ports');

            if (portsContainer.length) {
                const portT = this.getPortSVG(POSITIONS.TOP);
                const portThicknessOffset = 0.5;
                const portContainerT = portsContainer.find('.port');
                portContainerT.attr(
                    'transform',
                    `translate(${width / 2 - CONSTANTS.ONE_TERM_OFFSET - portThicknessOffset}, 0)`
                )
                portContainerT[0].appendChild(portT[0]);
                if (this.hostDesignerItem && childrenIds.length) {
                    const [connectorT] = this._registerConnectors(childrenIds);
                    connectorT.css({
                        'left': `${2 * width - 2 * CONSTANTS.ONE_TERM_OFFSET - 3}px`
                    });
                    this._portPositions[childrenIds[0]] = {
                        x: 2 * width - 2 * CONSTANTS.ONE_TERM_OFFSET + 2,
                        y: 0,
                        orientation: CONSTANTS.POSITIONS.TOP
                    };
                }
            }
        }
    };

    OneTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {

        if (this._portPositions[id]) {
            const angle = this._portPositions.orientation === POSITIONS.TOP ? 90 : 270;
            return [{
                x1: this._portPositions[id].x,
                x2: this._portPositions[id].x + 0.5,
                y1: this._portPositions[id].y,
                y2: this._portPositions[id].y + 0.5,
                angle1: angle,
                angle2: angle
            }];
        } else {
            return [];
        }
    };

    return OneTerminalComponent;
});
