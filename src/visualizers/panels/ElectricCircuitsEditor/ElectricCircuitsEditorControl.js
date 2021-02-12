/*globals define, WebGMEGlobal*/
define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames',
    './ElectricCircuitsEditorControl.META',
], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames,
    ElectricCircuitsEditorControlMETA
) {

    'use strict';

    function ElectricCircuitsEditorControl(options) {

        this._logger = options.logger.fork('Control');

        this._client = options.client;
        ElectricCircuitsEditorControlMETA.call(this, options.client);

        // Initialize core collections and variables
        this._widget = options.widget;

        this._currentNodeId = null;

        this._initWidgetFunctions();
        this._initWidgetEventHandlers();

        this._logger.debug('ctor finished');
    }

    Object.assign(ElectricCircuitsEditorControl.prototype, ElectricCircuitsEditorControlMETA.prototype);

    ElectricCircuitsEditorControl.prototype._initWidgetFunctions = function () {
        this._widget._getMetaTransformation = this._getMetaTransformation.bind(this);
    };

    ElectricCircuitsEditorControl.prototype._initWidgetEventHandlers = function () {

    };

    /* * * * * * * * Visualizer content update callbacks * * * * * * * */
    // One major concept here is with managing the territory. The territory
    // defines the parts of the project that the visualizer is interested in
    // (this allows the browser to then only load those relevant parts).
    ElectricCircuitsEditorControl.prototype.selectedObjectChanged = function (nodeId) {
        let self = this;

        // Remove current territory patterns
        if (self._currentNodeId) {
            self._client.removeUI(self._territoryId);
        }

        self._currentNodeId = nodeId;
        self._currentNodeParentId = undefined;

        if (typeof self._currentNodeId === 'string') {
            // Put new node's info into territory rules
            self._selfPatterns = {};
            self._selfPatterns[nodeId] = {children: 0};  // Territory "rule"

            self._widget.setTitle('');

            self._territoryId = self._client.addUI(self, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            self._client.updateTerritory(self._territoryId, self._selfPatterns);

            self._selfPatterns[nodeId] = {children: 1};
            self._client.updateTerritory(self._territoryId, self._selfPatterns);
        }
    };

    // This next function retrieves the relevant node information for the widget
    ElectricCircuitsEditorControl.prototype._getObjectDescriptor = function (nodeId) {
        var node = this._client.getNode(nodeId),
            objDescriptor;
        if (node) {
            objDescriptor = {
                id: node.getId(),
                name: node.getAttribute(nodePropertyNames.Attributes.name),
                childrenIds: node.getChildrenIds(),
                parentId: node.getParentId(),
                isConnection: GMEConcepts.isConnection(nodeId)
            };
        }

        return objDescriptor;
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    ElectricCircuitsEditorControl.prototype._eventCallback = function (events) {
        var i = events ? events.length : 0,
            event;

        this._logger.debug('_eventCallback \'' + i + '\' items');

        while (i--) {
            event = events[i];
            switch (event.etype) {

            case CONSTANTS.TERRITORY_EVENT_LOAD:
                this._onLoad(event.eid);
                break;
            case CONSTANTS.TERRITORY_EVENT_UPDATE:
                this._onUpdate(event.eid);
                break;
            case CONSTANTS.TERRITORY_EVENT_UNLOAD:
                this._onUnload(event.eid);
                break;
            default:
                break;
            }
        }

        this._logger.debug('_eventCallback \'' + events.length + '\' items - DONE');
    };

    ElectricCircuitsEditorControl.prototype._onLoad = function (gmeId) {
        const desc = this._getObjectDescriptor(gmeId);
        if (desc) {
            this._widget.addNode(desc);
        }
    };

    ElectricCircuitsEditorControl.prototype._onUpdate = function (gmeId) {
        const desc = this._getObjectDescriptor(gmeId);
        if (desc) {
            this._widget.updateNode(desc);
        }
    };

    ElectricCircuitsEditorControl.prototype._onUnload = function (gmeId) {
        this._widget.removeNode(gmeId);
    };

    ElectricCircuitsEditorControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    ElectricCircuitsEditorControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        if (this._territoryId) {
            this._client.removeUI(this._territoryId);
        }
    };

    ElectricCircuitsEditorControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    ElectricCircuitsEditorControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    ElectricCircuitsEditorControl.prototype.onActivate = function () {
        this._attachClientEventListeners();

        if (typeof this._currentNodeId === 'string') {
            WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
        }
    };

    ElectricCircuitsEditorControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
    };

    return ElectricCircuitsEditorControl;
});