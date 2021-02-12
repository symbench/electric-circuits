/*globals define, WebGMEGlobal*/
define([
    'joint/joint',
    './JointJSDashboard/build/JointDashboard',
    'css!joint/joint.css',
    'css!./JointJSDashboard/build/JointDashboard.css',
    'css!./styles/ElectricCircuitsEditorWidget.css'
], function (
    joint,
    JointDashboard
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
        window.v = joint.v;
        this.dashboard = new JointDashboard({target: this._el[0]});
        this.dashboard.initialize(joint);
    };

    ElectricCircuitsEditorWidget.prototype.onWidgetContainerResize = function (width, height) {
        this.dashboard.adjustPaperDimensions(width, height);
    };

    // Adding/Removing/Updating items
    ElectricCircuitsEditorWidget.prototype.addNode = function (desc) {

    };

    ElectricCircuitsEditorWidget.prototype.removeNode = function (gmeId) {

    };

    ElectricCircuitsEditorWidget.prototype.updateNode = function (desc) {
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    ElectricCircuitsEditorWidget.prototype.destroy = function () {
    };

    ElectricCircuitsEditorWidget.prototype.onActivate = function () {
        this.dashboard.render();
    };

    ElectricCircuitsEditorWidget.prototype.onDeactivate = function () {

    };

    ElectricCircuitsEditorWidget.prototype.buildGraph = function () {

    }

    return ElectricCircuitsEditorWidget;
});
