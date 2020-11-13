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
        this._portOrientations = {};
        if (node) {
            const isVertical = ElectricCircuitsMETA.TYPE_INFO.isVertical(node.getId());
            const childrenIDs = node.getChildrenIds();
            const svgIcon = this.skinParts.$svg;
            svgIcon.find('.port-1').empty();
            svgIcon.find('.port-2').empty();
            const portsContainer = svgIcon.find('.ports');

            if (portsContainer.length > 0) {
                const portLT = this.getPortSVG(isVertical ? POSITIONS.TOP : POSITIONS.LEFT);
                const portRB = this.getPortSVG(isVertical ? POSITIONS.BOTTOM : POSITIONS.RIGHT);
                const portContainerLT = portsContainer.find('.port-1');
                const portContainerRB = portsContainer.find('.port-2');
                portContainerLT.attr(
                    'transform',
                    isVertical ? CONSTANTS.TRANSFORMS.CONTAINER_TWO_TERM_T_V : CONSTANTS.TRANSFORMS.CONTAINER_TWO_TERM_L_H
                );
                portContainerRB.attr(
                    'transform',
                    isVertical ? CONSTANTS.TRANSFORMS.CONTAINER_TWO_TERM_B_V : CONSTANTS.TRANSFORMS.CONTAINER_TWO_TERM_R_H
                );

                this._portOrientations[childrenIDs[0]] = {
                    position : isVertical ? POSITIONS.TOP : POSITIONS.LEFT
                };

                this._portOrientations[childrenIDs[1]] = {
                    position: isVertical ? POSITIONS.BOTTOM : POSITIONS.RIGHT
                };

                portContainerLT[0].appendChild(portLT[0]);
                portContainerRB[0].appendChild(portRB[0]);

                if (this.hostDesignerItem && childrenIDs.length) {
                    const [connectorET, connectorWB] = this._registerConnectors(childrenIDs);
                    connectorET.css({
                        'top': isVertical ? "2px" : "18px",
                        'left': isVertical ? "67px" : "20px"
                    });
                    connectorWB.css({
                        'top': isVertical ? "88px" : "18px",
                        'left': isVertical ? "67px" : "114px"
                    });
                }
            }
        }
    };

    TwoTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        if (this._portOrientations[id]) {
            const position = this._portOrientations[id].position;
            const isVertical = [POSITIONS.TOP, POSITIONS.BOTTOM].includes(position);
            if (isVertical) {
                return this.getVerticalConnectionAreas(id, position);
            } else {
                return this.getHorizontalConnectionAreas(id, position);
            }
        } else {
            return [];
        }
    };

    TwoTerminalComponent.prototype.getVerticalConnectionAreas = function (id, position) {
        const isTop = position === POSITIONS.TOP;
        return [{
            id: id,
            x1: 72,
            y1: isTop ? 0 : 88,
            x2: 72,
            y2: isTop? 0: 88,
            angle1: isTop? 270 : 90,
            angle2: isTop ? 270: 90,
            len: 5
        }];
    };

    TwoTerminalComponent.prototype.getHorizontalConnectionAreas = function (id, position) {
        const isLeft = position === POSITIONS.LEFT;
        return [{
            'id': id,
            'x1': isLeft ? 20 : 120,
            'x2': isLeft ? 20 : 120,
            'y1': 22,
            'y2': 22,
            'angle1': isLeft ? 180 : 0,
            'angle2': isLeft ? 180 : 0,
            'len': 5
        }];
    };

    return TwoTerminalComponent;
});
