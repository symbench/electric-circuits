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
    const OneTerminalComponent = function () {};

    OneTerminalComponent.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        this._portOrientations = {};
        if(node) {
            const childrenIds = node.getChildrenIds();
            const svgIcon = this.skinParts.$svg;

            svgIcon.find('.port').empty();
            this._portsContainer = svgIcon.find('.ports');

            if(this._portsContainer.length) {
                const portT = this.getPortSVG(POSITIONS.TOP);
                const [ portContainerT ] = this._getPortContainers();

                portContainerT[0].appendChild(portT[0]);
                if(this.hostDesignerItem && childrenIds.length) {
                    const [ connectorT ] = this._registerConnectors(childrenIds);
                    connectorT.css({
                        'left': '67px'
                    });
                }
            }
        }
    };

    OneTerminalComponent.prototype._getPortContainers = function () {
        const portContainerT = this._portsContainer.find('.port-1');
        portContainerT.attr(
            'transform',
            CONSTANTS.TRANSFORMS.CONTAINER_ONE_TERM_T
        )
        return [portContainerT];
    };

    OneTerminalComponent.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        return [{
            'x1': 67,
            'x2': 67,
            'y1': 0,
            'y2': 0,
            'angle1': 90,
            'angle2': 90
        }];
    };

    return OneTerminalComponent;
});
