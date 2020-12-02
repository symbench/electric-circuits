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
    const Pin = function () {
    };

    Pin.prototype._updatePorts = function () {
        const node = this.getCurrentNode();
        const svgIcon = this.skinParts.$svg;
        if (node) {
            let connector  = this._registerConnectors([node.getId()]);
            if(connector) {
                connector = connector[0];
                connector.css({
                    top: '2px',
                    left: '75px'
                });
            }
        }

    };

    Pin.prototype.getConnectionAreas = function (id, isEnd, connectionMetaInfo) {
        return [{
            id: id,
            x1: 75,
            x2: 75,
            y1: 6,
            y2: 6,
            angle1: 0,
            angle2: 0,
            len: 5
        }];
    };

    return Pin;
});
