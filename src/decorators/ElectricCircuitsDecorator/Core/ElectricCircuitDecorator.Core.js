/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/* globals define, $, _ */

'use strict';

define([
    'js/Constants',
    'js/NodePropertyNames',
    './ElectricCircuits.META',
    './ElectricCircuits.Circuit',
    './ElectricCircuits.FETs',
    './ElectricCircuits.OpAmps',
    './ElectricCircuit.OneTerm',
    './ElectricCircuits.TwoTerm',
    './ElectricCircuits.ThreeTerm',
    './ElectricCircuits.FourTerm',
    './ElectricCircuits.Junction',
    './ElectricCircuits.Pin',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    './ElectricCircuits.Constants',
    'text!./ElectricCircuitsDecorator.html',
    'text!../default.svg',
    'text!../Icons/Port.svg'
], function (
    CONSTANTS,
    nodePropertyNames,
    ElectricCircuitsMETA,
    Circuit,
    FETs,
    OpAmps,
    OneTerminalComponent,
    TwoTerminalComponent,
    ThreeTerminalComponent,
    FourTerminalComponent,
    Junction,
    Pin,
    DiagramDesignerWidgetConstants,
    ElectricCircuitsDecoratorConstants,
    ElectricCircuitsDecoratorTemplate,
    DefaultSVGTemplate,
    PortSVGTemplate
) {
    const SVG_ICON_PATH = '/decorators/ElectricCircuitsDecorator/Icons/',
        svgCache = {},
        errorSVGBase = $(DefaultSVGTemplate),
        portSVGBase = $(PortSVGTemplate);

    const ElectricCircuitsDecoratorCore = function () {
    };

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
        this._displayConnectors = params && params.connectors ? params.connectors : false;

        if (Object.keys(svgCache || {}).length === 0) {
            var _metaAspectTypes = ElectricCircuitsMETA.getDecoratedMetaTypes();
            for (var m in _metaAspectTypes) {

                if (_metaAspectTypes.hasOwnProperty(m)) {

                    // get the svg's url on the server for this META type
                    var svg_resource_url = SVG_ICON_PATH + m + '.svg';

                    // get the svg from the server in SYNC mode, may take some time
                    $.ajax(svg_resource_url, {'async': false})
                        .done(function (data) {

                            // TODO: console.debug('Successfully downloaded: ' + svg_resource_url + ' for ' + metaType);
                            // downloaded successfully
                            // cache the downloaded content
                            svgCache[m] = $(data.childNodes[0]);
                        })
                        .fail(function () {
                            // download failed for this type
                            // TODO: console.warning('Failed to download: ' + svg_resource_url);
                        });
                }
            }
        }

    };

    ElectricCircuitsDecoratorCore.prototype.getSVGByMetaType = function (gmeId) {
        const ComponentClassName = ElectricCircuitsMETA.getMetaTypeOf(gmeId);
        if (ComponentClassName && svgCache[ComponentClassName]) {
            return svgCache[ComponentClassName].clone();
        } else {
            return this.getErrorSVG();
        }
    };

    ElectricCircuitsDecoratorCore.prototype.getPortSVG = function (position) {
        let portSVG = portSVGBase.clone();
        switch (position.toLowerCase()) {
        case 'top':
            portSVG.attr(
                'width',
                ElectricCircuitsDecoratorConstants.TRANSFORMS.VERTICAL_W
            );
            portSVG.attr(
                'height',
                ElectricCircuitsDecoratorConstants.TRANSFORMS.VERTICAL_H
            );
            portSVG.find(
                ElectricCircuitsDecoratorConstants.PORT_CLASS
            ).attr(
                'transform',
                ElectricCircuitsDecoratorConstants.TRANSFORMS.PORT_TOP
            );
            break;

        case 'bottom':
            portSVG.attr(
                'width',
                ElectricCircuitsDecoratorConstants.TRANSFORMS.VERTICAL_W
            );
            portSVG.attr(
                'height',
                ElectricCircuitsDecoratorConstants.TRANSFORMS.VERTICAL_H
            );
            portSVG.find(
                ElectricCircuitsDecoratorConstants.PORT_CLASS
            ).attr(
                'transform',
                ElectricCircuitsDecoratorConstants.TRANSFORMS.PORT_BOTTOM
            );
            break;

        case 'right':
            portSVG.find(
                ElectricCircuitsDecoratorConstants.PORT_CLASS
            ).attr(
                'transform',
                ElectricCircuitsDecoratorConstants.TRANSFORMS.PORT_RIGHT
            );
            break;

        case 'left':
        default:
            break;
        }

        return portSVG;
    };

    ElectricCircuitsDecoratorCore.prototype.getErrorSVG = function () {
        return errorSVGBase.clone();
    };

    ElectricCircuitsDecoratorCore.prototype.doSearch = function () {

    };

    ElectricCircuitsDecoratorCore.prototype._renderContent = function () {
        const gmeID = this._metaInfo[CONSTANTS.GME_ID];
        this._metaType = ElectricCircuitsMETA.getMetaTypes(gmeID);

        if (DEBUG) {
            this.$el.attr({'data-id': gmeID});
        }

        this.skinParts.$name = this.$el.find('.name');

        this.$el.find('.svg-container').empty();

        this.skinParts.$svg = this.getSVGByMetaType(gmeID);

        if (this.skinParts.$svg) {
            this.$el.find('.svg-container').append(this.skinParts.$svg);
            this.skinParts.$connectorContainer = this.$el.find('.connector-container');
            this.skinParts.$connectorContainer.empty();
        } else {
            this.$el.find('.svg-container').append(this.getErrorSVG());
        }

        if (ElectricCircuitsMETA.TYPE_INFO.isOpAmp(gmeID) || ElectricCircuitsMETA.TYPE_INFO.isOpAmpDetailed(gmeID)) {
            _.extend(this, new OpAmps());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isNMOS(gmeID) || ElectricCircuitsMETA.TYPE_INFO.isPMOS(gmeID)) {
            _.extend(this, new FETs());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isCircuit(gmeID)) {
            _.extend(this, new Circuit());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isPin(gmeID)) {
            _.extend(this, new Pin());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isJunction(gmeID)) {
            _.extend(this, new Junction());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isOneTerm(gmeID)) {
            _.extend(this, new OneTerminalComponent());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isTwoTerm(gmeID) || ElectricCircuitsMETA.TYPE_INFO.isPotentiometer(gmeID)) {
            _.extend(this, new TwoTerminalComponent());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isThreeTerm(gmeID)) {
            _.extend(this, new ThreeTerminalComponent());
        } else if (ElectricCircuitsMETA.TYPE_INFO.isFourTerm(gmeID)) {
            _.extend(this, new FourTerminalComponent());
        }
        this._renderMetaTypeSpecificParts();
        this.update();
    };

    ElectricCircuitsDecoratorCore.prototype.update = function () {
        this._update();
        if (this._displayConnectors) {
            this.initializeConnectors();
        }
    };

    ElectricCircuitsDecoratorCore.prototype._renderMetaSpecificName = function () {

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

    ElectricCircuitsDecoratorCore.prototype._updatePorts = function () {

    };

    ElectricCircuitsDecoratorCore.prototype._updateName = function () {
        const control = this._control,
            gmeID = this._metaInfo[CONSTANTS.GME_ID],
            node = control._client.getNode(gmeID),
            name = node ? node.getAttribute(nodePropertyNames.Attributes.name) : '';

        if (this.skinParts.$name) {
            if (name.indexOf('!') === 0) {
                this.skinParts.$name.text(name.slice(1));
                this.skinParts.$name.css('text-decoration', 'overline');
            } else {
                this.skinParts.$name.text(name);
                this.skinParts.$name.css('text-decoration', 'none');
            }
            this.skinParts.$name.css('text-align', 'center');
            this.skinParts.$name.css('max-width', `${+this.skinParts.$svg.attr('width')}px`);
        }
        this._renderMetaSpecificName();
    };

    ElectricCircuitsDecoratorCore.prototype._renderMetaTypeSpecificParts = function () {

    };

    ElectricCircuitsDecoratorCore.prototype.getCurrentNode = function () {
        const gmeID = this._metaInfo[CONSTANTS.GME_ID],
            client = this._control._client;
        return client.getNode(gmeID);
    };

    ElectricCircuitsDecoratorCore.prototype._registerConnectors = function (portIds) {
        if (this._displayConnectors) {
            return portIds.map(portId => {
                const connectorEl = $('<div/>', {'class': DiagramDesignerWidgetConstants.CONNECTOR_CLASS});
                this.hostDesignerItem.registerConnectors(connectorEl, portId);
                this.hostDesignerItem.registerSubcomponent(portId, {GME_ID: portId});
                this.skinParts.$connectorContainer.append(connectorEl);
                return connectorEl;
            });
        }

    };

    return ElectricCircuitsDecoratorCore;
});
