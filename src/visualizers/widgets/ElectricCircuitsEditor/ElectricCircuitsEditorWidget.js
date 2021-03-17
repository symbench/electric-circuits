/*globals define, $*/
define([
    'joint/joint',
    'dagre',
    'graphlib',
    'elk',
    './CircuitEditorDashboard/build/CircuitEditorDashboard',
    'js/Widgets/ZoomWidget/ZoomWidget',
    'css!joint/joint.css',
    'css!./CircuitEditorDashboard/build/CircuitEditorDashboard.css',
    'css!./styles/ElectricCircuitsEditorWidget.css'
], function (
    joint,
    dagre,
    graphlib,
    ELK,
    CircuitEditorDashboard,
    ZoomWidget
) {
    'use strict';

    var WIDGET_CLASS = 'electric-circuits-editor';

    function ElectricCircuitsEditorWidget(logger, container) {
        this._logger = logger.fork('Widget');

        this._el = container;
        this._initialize();

        this._logger.debug('ctor finished');
    }

    ElectricCircuitsEditorWidget.prototype._initialize = function () {
        this._el.addClass(WIDGET_CLASS);
        window.g = joint.g;
        window.V = joint.V;
        const jointContainer = $('<div/>');

        this.dashboard = new CircuitEditorDashboard({target: jointContainer[0]});
        this.dashboard.initialize(joint, dagre, graphlib, ELK);

        this.dashboard.events().addEventListener(
            'recommendationRequested',
            async (event) => {
                try{
                    const recommendations = await this.runRecommendationPlugin(event.detail.pluginMetadata);
                    this.dashboard.showRecommendationsSuccess(recommendations);
                } catch (e) {
                    console.log(e);
                    this.dashboard.showRecommendationsFail(e);
                }

            }
        );

        this.zoomWidget = new ZoomWidget({
            class: 'electric-circuits-editor-zoom-container',
            sliderClass: 'electric-circuits-editor-zoom-slider',
            zoomTarget: jointContainer,
            zoomValues: this.dashboard.getZoomLevels(),
            onZoom:  zoomLevel => {
                jointContainer.css({transform: 'scale(1.0)'});
                this.dashboard.zoom(zoomLevel);
            }
        });

        this._el.append(this.zoomWidget.$zoomContainer);
        this._el.append(jointContainer);
    };

    ElectricCircuitsEditorWidget.prototype.onWidgetContainerResize = function (width, height) {
        this.dashboard.adjustPaperDimensions(width, height);
    };

    // Adding/Removing/Updating items
    ElectricCircuitsEditorWidget.prototype.addNode = function (desc) {
        this.dashboard.addCell(desc);
    };

    ElectricCircuitsEditorWidget.prototype.removeNode = function (/*gmeId*/) {
    //    ToDo: Not Interactive Yet
    };

    ElectricCircuitsEditorWidget.prototype.updateNode = function (desc) {
        this.dashboard.updateCell(desc);
    };

    ElectricCircuitsEditorWidget.prototype.setDashboardTitle = function (title) {
        this.dashboard.setTitle(title);
    };

    ElectricCircuitsEditorWidget.prototype.requestLayout = function () {
        if(this.dashboard){
            this.dashboard.layout();
        }
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    ElectricCircuitsEditorWidget.prototype.destroy = function () {
        this.dashboard.clearCircuitGraph();
    };

    ElectricCircuitsEditorWidget.prototype.onActivate = function () {
        this.dashboard.render({
            pluginMetadata: this.getRecommendationPluginMetadata()
        });
    };

    ElectricCircuitsEditorWidget.prototype.onDeactivate = function () {
        this.dashboard.clearCircuitGraph();
    };

    return ElectricCircuitsEditorWidget;
});
