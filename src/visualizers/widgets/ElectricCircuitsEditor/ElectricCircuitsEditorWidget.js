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
    const JOINT_DOMAIN_PREFIX = 'circuit';

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
        this.dashboard.initialize(joint, dagre, graphlib, ELK, {
            activeObjectChangeFn: (id) => {
                if(this.canBeActiveObject(id)) {
                    this.dashboard.clearGraph();
                    this.changeActiveObject(id);
                    this.dashboard.setNested(this.isNestedDisplay());
                    this.dashboard.setParentName(this.getParentName());
                }
            },
            goToParentFn: () => {
                this.dashboard.clearGraph();
                this.showParent();
                this.dashboard.setNested(this.isNestedDisplay());
            },
            toolViewRemoveFn: (id) => {
                this.onNodeDeleted(id);
            },
            toolViewAddFn: (id) => {
                const type = this.dashboard.getElementTypeById(id);
                this.onNodeCreated({
                    type: type.replace(JOINT_DOMAIN_PREFIX, '')
                });
                this.dashboard.getConnectedTargets(id);
                this.dashboard.layout();
            },
            undoPluginResultsFn: () => {
                this.dashboard.removeTemporaryElements();
            }
        });

        this.dashboard.events().addEventListener(
            'recommendationRequested',
            async (event) => {
                try {
                    const recommendations = await this.runRecommendationPlugin(event.detail.pluginMetadata);
                    const recommendedCells = this.getPartBrowserRecommendations(recommendations);
                    // These nodes never are created by the WebGME
                    this.dashboard.showPartBrowserRecommendation(recommendedCells, 3);
                    this.requestTemporaryNodesCreation(recommendations);
                } catch (e) {
                    this.dashboard.showRecommendationFail(e);
                }
            }
        );

        this.dashboard.events().addEventListener('nodeCreated', (event) => {
            this.onNodeCreated({
                type: event.detail.type.replace(`${JOINT_DOMAIN_PREFIX}.`, ''),
                position: event.detail.position,
                isTemporary: event.detail.isTemporary,
            });
        });

        this.zoomWidget = new ZoomWidget({
            class: 'electric-circuits-editor-zoom-container',
            sliderClass: 'electric-circuits-editor-zoom-slider',
            zoomTarget: jointContainer,
            zoomValues: this.dashboard.getZoomLevels(),
            onZoom: zoomLevel => {
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

    ElectricCircuitsEditorWidget.prototype.removeNode = function (gmeId) {
        this.dashboard.removeCell(gmeId);
    };

    ElectricCircuitsEditorWidget.prototype.updateNode = function (desc) {
        this.dashboard.updateCell(desc);
    };

    ElectricCircuitsEditorWidget.prototype.setDashboardTitle = function (title) {
        this.dashboard.setTitle(title);
    };

    ElectricCircuitsEditorWidget.prototype.requestLayout = function () {
        if (this.dashboard) {
            this.dashboard.layout();
        }
    };

    ElectricCircuitsEditorWidget.prototype.getPartBrowserRecommendations = function (recommendations) {
        const recommendedCells = {};
        recommendations.forEach(([cellList, confidence]) => {
            cellList.forEach(node => {
                recommendedCells[node.type] = `${(confidence * 100).toFixed(4)} %`;
            });
        });
        return recommendedCells;
    };

    ElectricCircuitsEditorWidget.prototype.requestTemporaryNodesCreation = function (recommendations, topN=3) {
        const componentNodes = [];
        // const wires = [];
        const components = recommendations.flatMap(arr => arr[0]).slice(0, topN);
        // First Create Nodes
        components.forEach((component, index, records) => {
            // We are restricting the node creation only
            // if wires can be predicted by the model
            if (component.pins.length === 0) {
                return;
            }
            componentNodes.push({
                type: component.type,
                domainPrefix: JOINT_DOMAIN_PREFIX,
                isTemporary: true,
                opacity: 0.7 * (records.length - index) / records.length,
                pins: component.pins,
            });
        });

        if(componentNodes.length) {
            componentNodes.forEach(comp => {
                const cellId = this.dashboard.addCell(comp);
                comp.pins.forEach((pin, index) => {
                    const target = {
                        id: this.dashboard.getElementByPort(pin),
                        port: pin
                    };
                    const source = {
                        id: cellId,
                        port: this.dashboard.getPortIdBySpiceIndex(cellId, index),
                    };

                    const wire = {
                        domainPrefix: JOINT_DOMAIN_PREFIX,
                        type: 'ELKWire',
                        source: source,
                        target: target
                    };
                    this.dashboard.addCell(wire);
                });
            });
        }

        this.dashboard.layout();
    };

    ElectricCircuitsEditorWidget.prototype.onNodeDeleted = function (id) {
        this.dashboard.removeCell(id);
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    ElectricCircuitsEditorWidget.prototype.destroy = function () {
        this.dashboard.clearGraph();
    };

    ElectricCircuitsEditorWidget.prototype.onActivate = function () {
        this.dashboard.render({
            recommendationPluginMetadata: this.getRecommendationPluginMetadata(),
            validComponents: this.getValidComponents()
        });
    };

    ElectricCircuitsEditorWidget.prototype.onDeactivate = function () {
        this.dashboard.clearGraph();
    };

    return ElectricCircuitsEditorWidget;
});
