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

    const FourTerminalComponent = function () {
    };

    FourTerminalComponent.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portOrientations = {};

        if (node) {
            const childrenIDs = node.getChildrenIds();
            const svgIcon = this.skinParts.$svg;
            for (let i = 1; i < 5; i++) {
                svgIcon.find(`.port-${i}`).empty();
            }
            this._portsContainer = svgIcon.find('.ports');

            if (this._portsContainer.length) {
                const portFunc = ElectricCircuitMETA.TYPE_INFO.isJunction(node.getId())
                    ? this.getJunctionPortSVG : this.getPortSVG;
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
                ] = this._getPortContainers();

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

                    childrenIDs.forEach((id, index) => {
                       this._portOrientations[id] = {
                           position: positions[index]
                       }
                    });

                    connectorT.css({
                        'left': '67px'
                    });

                    connectorB.css({
                        'left': '67px',
                        'top': '23px'
                    });

                    connectorL.css({
                        'left': '55px',
                        'top': '12px'
                    });

                    connectorR.css({
                        'left': '78px',
                        'top': '12px'
                    });
                }
            }
        }
    };

    FourTerminalComponent.prototype._getPortContainers = function () {
        const portsContainerT = this._portsContainer.find('.port-1');
        const portsContainerB = this._portsContainer.find('.port-2');
        const portsContainerL = this._portsContainer.find('.port-3');
        const portsContainerR = this._portsContainer.find('.port-4');

        portsContainerT.attr(
            'transform',
            'translate(7.8, 6)'
        );

        portsContainerB.attr(
            'transform',
            'translate(7.8, 9)'
        );

        portsContainerL.attr(
            'transform',
            'translate(5.5, 7.5)'
        );

        portsContainerR.attr(
            'transform',
            'translate(9.5, 7.5)'
        );

        return [portsContainerT, portsContainerB, portsContainerL, portsContainerR];
    };

    FourTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if(this._portOrientations[id]) {
            const position = this._portOrientations[id].position;
            let x, y, angle;
            if (position === POSITIONS.TOP) {
                x=71.8;
                y=0;
                angle=90;
            } else if (position === POSITIONS.BOTTOM) {
                x=71.8;
                y=30;
                angle=270;
            } else if (position === POSITIONS.LEFT) {
                x=62;
                y=16;
                angle=180;
            } else if (position === POSITIONS.RIGHT) {
                x=80;
                y=16;
                angle=0;
            }
            return [{
                x1: x,
                x2: x,
                y1: y,
                y2: y,
                angle1: angle,
                angle2: angle
            }];
        } else {
            return [];
        }
    };

    FourTerminalComponent.prototype.getJunctionPortSVG = function (position) {
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

    return FourTerminalComponent;
});
