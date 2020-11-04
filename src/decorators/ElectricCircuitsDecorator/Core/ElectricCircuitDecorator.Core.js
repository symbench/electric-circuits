/* globals define, $ */
/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */

'use strict';

define([
    'js/Constants',
    'js/NodePropertyNames',
    './ElectricCircuits.META',
    'text!./ElectricCircuitsDecorator.html',
    'text!../default.svg',
], function (
    CONSTANTS,
    nodePropertyNames,
    ElectricCircuitsMETA,
    ElectricCircuitsDecoratorTemplate,
    DefaultSVGTemplate
) {
    const SVG_ICON_PATH = '/decorators/ElectricCircuitsDecorator/Icons/',
        svgCache = {},
        errorSVGBase = $(DefaultSVGTemplate);

    const ElectricCircuitsDecoratorCore = function () {};

    ElectricCircuitsDecoratorCore.prototype.$DOMBase = function () {
        const el = () => {
            return $(ElectricCircuitsDecoratorTemplate);
        };
        return el();
    }();

    ElectricCircuitsDecoratorCore.prototype.getTerritoryQuery = function () {
        let territoryRule = {};
        territoryRule[this._metaInfo[CONSTANTS.GME_ID]] = {'children': 1};
        return territoryRule;
    };

    ElectricCircuitsDecoratorCore.prototype._initializeDecorator = function (params) {
        this.$name = undefined;
        const _metaAspectTypes = ElectricCircuitsMETA.getDecoratedMetaTypes();

        Object.keys(_metaAspectTypes).forEach(m => {
            const svgResourceURL = SVG_ICON_PATH + m + '.svg';

            $.ajax(svgResourceURL, {'async': false}).done(data => {
                svgCache[m] = $(data.childNodes[0]);
            }).fail(() => {});
        });
    };

    ElectricCircuitsDecoratorCore.prototype.getSVGByMetaType = function (gmeId) {
        const ComponentClassName = ElectricCircuitsMETA.getMetaTypeOf(gmeId);
        if(ComponentClassName && svgCache[ComponentClassName]) {
            return svgCache[ComponentClassName];
        } else {
            return this.getErrorSVG();
        }

    };

    ElectricCircuitsDecoratorCore.prototype.getPortSVG = function () {

    };

    ElectricCircuitsDecoratorCore.prototype.getErrorSVG = function () {
        return errorSVGBase.clone();
    };

    ElectricCircuitsDecoratorCore.prototype.doSearch = function () {

    };

    ElectricCircuitsDecoratorCore.prototype._renderContent = function () {
        const gmeID = this._metaInfo[CONSTANTS.GME_ID];
        this._metaType = ElectricCircuitsMETA.getMetaTypes(gmeID);

        if(DEBUG) {
            this.$el.attr({'data-id': gmeID});
        }

        this.skinParts.$name = this.$el.find('.name');

        this.$el.find('.svg-container').empty();

        this.skinParts.$svg = this.getSVGByMetaType(gmeID);

        if(this.skinParts.$svg) {
            this.$el.find('.svg-container').append(this.skinParts.$svg);
        } else {
            this.$el.find('.svg-container').append(this.getErrorSVG());
        }

        this.update();
    };

    ElectricCircuitsDecoratorCore.prototype.update = function () {
        this._update();
    };

    ElectricCircuitsDecoratorCore.prototype._update = function () {
        const gmeID = this._metaInfo[CONSTANTS.GME_ID],
            client = this._control._client,
            nodeObj = client.getNode(gmeID),
            childrenIDs = nodeObj ? nodeObj.getChildrenIds() : [];

        childrenIDs.forEach((childID, index, array) => {
            const portId = childrenIDs[array.length - index];
            this._registerForNotification(portId);
        });

        this._updateName();

        this._updatePorts();

    };

    ElectricCircuitsDecoratorCore.prototype._updateName = function () {
        const control = this._control,
            gmeID = this._metaInfo[CONSTANTS.GME_ID],
            node = control._client.getNode(gmeID),
            name = node ? node.getAttribute(nodePropertyNames.Attributes.name): '';

        if(this.skinParts.$name) {
            if (name.indexOf('!') === 0) {
                this.skinParts.$name.text(name.slice(1));
                this.skinParts.$name.css('text-decoration', 'overline');
            } else {
                this.skinParts.$name.text(name);
                this.skinParts.$name.css('text-decoration', 'none');
            }
        }
    };

    ElectricCircuitsDecoratorCore.prototype._updatePorts = function () {

    };

    ElectricCircuitsDecoratorCore.prototype._renderMetaTypeSpecificParts = function () {

    };

    ElectricCircuitsDecoratorCore.prototype._registerForNotification = function (portId) {

    };

    ElectricCircuitsDecoratorCore.prototype._unregisterForNotification = function (portId) {

    };

    return ElectricCircuitsDecoratorCore;
});
