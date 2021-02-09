/*globals define, WebGMEGlobal*/
define([
    './JointJSDashboard/build/JointDashboard',
    'css!./JointJSDashboard/build/JointDashboard.css',
    'css!./styles/ElectricCircuitsEditorWidget.css'
], function (
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
        this.dashBoard = new JointDashboard({target: this._el[0]});
    };

    ElectricCircuitsEditorWidget.prototype.onWidgetContainerResize = function (width, height) {
        this.dashBoard.render(width, height);
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

    };

    ElectricCircuitsEditorWidget.prototype.onDeactivate = function () {

    };

    return ElectricCircuitsEditorWidget;
});
