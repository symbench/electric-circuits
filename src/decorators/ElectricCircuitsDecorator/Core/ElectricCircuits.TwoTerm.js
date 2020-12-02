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
    const TwoTerminalComponent = function () {
    };

    TwoTerminalComponent.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portPositions = {};
        if (node) {
            const isVertical = ElectricCircuitsMETA.TYPE_INFO.isVertical(node.getId());
            const isPotentiometer = ElectricCircuitsMETA.TYPE_INFO.isPotentiometer(node.getId());
            const childrenIDs = node.getChildrenIds().sort();
            const svgIcon = this.skinParts.$svg;
            svgIcon.find('.port-p').empty();
            svgIcon.find('.port-n').empty();
            if (isPotentiometer) {
                svgIcon.find('.port-out').empty();
            }
            this.skinParts.$connectorContainer.empty();
            const portsContainer = svgIcon.find('.ports');

            if (portsContainer.length > 0) {
                let portOut, portContainerOut;
                const portLT = this.getPortSVG(isVertical ? POSITIONS.TOP : POSITIONS.LEFT);
                const portRB = this.getPortSVG(isVertical ? POSITIONS.BOTTOM : POSITIONS.RIGHT);

                const portContainerLT = portsContainer.find('.port-p');
                const portContainerRB = portsContainer.find('.port-n');
                const width = +svgIcon.attr('width');
                const height = +svgIcon.attr('height');

                if (isPotentiometer) {
                    portOut = this.getPortSVG(POSITIONS.TOP);
                    portContainerOut = portsContainer.find('.port-out');
                }

                let translateP,
                    translateN,
                    translateOut,
                    portWidth,
                    portHeight,
                    connectorETCSS,
                    connectorWBCSS,
                    connectorOutCSS;

                if (isVertical) {
                    portHeight = +portRB.attr('height');
                    translateP = `translate(${(width / 2) - CONSTANTS.TWO_TERM_OFFSET}, 0)`;
                    translateN = `translate(${(width / 2) - CONSTANTS.TWO_TERM_OFFSET}, ${height - portHeight})`;
                    connectorETCSS = {
                        top: '0px',
                        left: `${2 * (width - CONSTANTS.TWO_TERM_OFFSET) - 3}px`
                    };
                    connectorWBCSS = {
                        top: `${height - 2 * CONSTANTS.TWO_TERM_OFFSET}px`,
                        left: `${2 * (width - CONSTANTS.TWO_TERM_OFFSET) - 3}px`
                    };

                    this._portPositions[childrenIDs[0]] = {
                        x: 2 * (width - CONSTANTS.TWO_TERM_OFFSET) + 1,
                        y: 0,
                        orientation: POSITIONS.TOP
                    };
                    this._portPositions[childrenIDs[1]] = {
                        x: 2 * (width - CONSTANTS.TWO_TERM_OFFSET) + 1,
                        y: height - 2 * CONSTANTS.TWO_TERM_OFFSET,
                        orientation: POSITIONS.BOTTOM
                    }
                } else {
                    portWidth = +portLT.attr('width');
                    translateP = `translate(0, ${(height / 2) - CONSTANTS.TWO_TERM_OFFSET})`;
                    translateN = `translate(${width - portWidth}, ${(height / 2) - CONSTANTS.TWO_TERM_OFFSET})`;
                    connectorETCSS = {
                        top: `${(height / 2) - CONSTANTS.TWO_TERM_OFFSET}px`,
                        left: `${2 * portWidth + 2}px`
                    };
                    connectorWBCSS = {
                        top: `${(height / 2) - CONSTANTS.TWO_TERM_OFFSET}px`,
                        left: `${2 * portWidth + width - CONSTANTS.TWO_TERM_OFFSET - 2}px`
                    };
                    this._portPositions[childrenIDs[0]] = {
                        x: 2 * portWidth + 2,
                        y: height / 2,
                        orientation: POSITIONS.LEFT
                    };
                    this._portPositions[childrenIDs[1]] = {
                        x: 2 * portWidth + width - CONSTANTS.TWO_TERM_OFFSET - 2,
                        y: height / 2,
                        orientation: POSITIONS.RIGHT
                    };
                    if (isPotentiometer) {
                        translateOut = `translate(${width / 2 - CONSTANTS.TWO_TERM_OFFSET}, 0)`;
                        connectorOutCSS = {
                            top: '0px',
                            left: `${width - 2 * CONSTANTS.TWO_TERM_OFFSET - 3}px`
                        };
                        this._portPositions[childrenIDs[2]] = {
                            x: width - 2 * CONSTANTS.TWO_TERM_OFFSET + 2,
                            y: 0,
                            orientation: POSITIONS.TOP
                        };
                    }
                }
                portContainerLT.attr(
                    'transform',
                    translateP
                );
                portContainerRB.attr(
                    'transform',
                    translateN
                );

                portContainerLT[0].appendChild(portLT[0]);
                portContainerRB[0].appendChild(portRB[0]);
                if (isPotentiometer) {
                    portContainerOut.attr('transform', translateOut);
                    portContainerOut[0].appendChild(portOut[0]);
                }

                if (this.hostDesignerItem && childrenIDs.length) {
                    let connectorET, connectorWB, connectorOut;
                    if (isPotentiometer) {
                        [connectorET, connectorWB, connectorOut] = this._registerConnectors(childrenIDs);
                        connectorOut.css(connectorOutCSS);
                    } else {
                        [connectorET, connectorWB] = this._registerConnectors(childrenIDs);
                    }

                    connectorET.css(connectorETCSS);
                    connectorWB.css(connectorWBCSS);
                }
            }
        }
    };

    TwoTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portPositions[id]) {
            let angle;
            switch (this._portPositions[id].orientation) {
                case POSITIONS.LEFT:
                default:
                    angle = 180;
                    break;
                case POSITIONS.RIGHT:
                    angle = 0;
                    break;
                case POSITIONS.TOP:
                    angle = 270;
                    break;
                case POSITIONS.BOTTOM:
                    angle = 90;
                    break;
            }
            return [{
                id: id,
                x1: this._portPositions[id].x,
                x2: this._portPositions[id].x + 0.5,
                y1: this._portPositions[id].y,
                y2: this._portPositions[id].y + 0.5,
                angle1: angle,
                angle2: angle,
                len: 5
            }];
        } else {
            return [];
        }
    };

    return TwoTerminalComponent;
});
