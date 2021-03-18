/*globals define, WebGMEGlobal*/
define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames',
    './ElectricCircuitEditorControl.Joint'
], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames,
    JointControl
) {

    'use strict';

    class ElectricCircuitsEditorControl extends JointControl {
        constructor(options) {
            super(options.client);

            this._logger = options.logger.fork('Control');
            this._client = options.client;

            this._widget = options.widget;

            this._currentNodeId = null;

            this._initWidgetEventHandlers();

            this._logger.debug('ctor finished');
        }

        _initWidgetEventHandlers() {
            this._widget.onNodeAttributeChanged = this.onNodeAttributeChanged.bind(this);
            this._widget.onNodeCreated = this.onNodeCreated.bind(this);
            this._widget.getValidComponents = this.getValidPartBrowserNodes.bind(this);
        }

        onNodeAttributeChanged(nodeId, attrs) {
            Object.keys(attrs).forEach(name => {
                this._client.startTransaction(`About to change attribute ${name} of node ${nodeId}`);
                this._client.setAttribute(nodeId, name, attrs[name]);
                this._client.completeTransaction(`Set attribute ${name} of node ${nodeId} to ${attrs[name]}`, null);
            });
        }

        onNodeCreated(nodeType, position) {
            this._client.startTransaction(`About to create node of type ${nodeType}`);
            const nodeId = this._client.createNode({
                baseId: this.META_NAMES[nodeType],
                parentId: this._currentNodeId
            });

            if(position){
                this._client.setRegistry(nodeId, 'position', position, `Set position to ${position}`);
            }
            this._client.completeTransaction(`Created node of type ${nodeType}`);
        }

        selectedObjectChanged(nodeId) {
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
                self._selfPatterns[nodeId] = {children: 3};  // Territory "rule"

                self._widget.setTitle('');

                self._territoryId = self._client.addUI(self, function (events) {
                    self._eventCallback(events);
                });

                // Update the territory
                self._client.updateTerritory(self._territoryId, self._selfPatterns);

                self._selfPatterns[nodeId] = {children: 3};
                self._client.updateTerritory(self._territoryId, self._selfPatterns);
            }
        }

        _getObjectDescriptor(nodeId) {
            if (this.isCircuit(nodeId) && !this.isSubCircuit(nodeId)) {
                return;
            }
            if (this.isPin(nodeId) && !this.isCircuitPin(nodeId)) {
                return;
            }
            if(this.isInsideCCSource(nodeId) || this.isInsideSubCircuit(nodeId)){
                return;
            }
            return this.toJointJSON(nodeId);
        }

        _eventCallback(events) {
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
            if(events){
                this._widget.requestLayout();
            }
            this._logger.debug('_eventCallback \'' + events.length + '\' items - DONE');
        }

        _onLoad(gmeId) {
            const desc = this._getObjectDescriptor(gmeId);
            if (desc) {
                this._widget.addNode(desc);
            }
            if(this.isCircuit(gmeId) || !this.isSubCircuit(gmeId)) {
                const name = this._client.getNode(gmeId).getAttribute('name');
                this._widget.setDashboardTitle(name);
            }
        }

        _onUpdate(gmeId) {
            const desc = this._getObjectDescriptor(gmeId);
            if (desc) {
                this._widget.updateNode(desc);
            }
            if(this.isCircuit(gmeId) || !this.isSubCircuit(gmeId)) {
                const name = this._client.getNode(gmeId).getAttribute('name');
                this._widget.setTitle(name);
            }
        }

        _onUnload(gmeId) {
            this._widget.removeNode(gmeId);
        }

        _stateActiveObjectChanged(model, activeObjectId) {
            if (this._currentNodeId === activeObjectId) {
                // The same node selected as before - do not trigger
            } else {
                this._widget.destroy();
                this.selectedObjectChanged(activeObjectId);
            }
        }

        /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
        destroy() {
            this._detachClientEventListeners();
            if (this._territoryId) {
                this._client.removeUI(this._territoryId);
            }
        }

        _attachClientEventListeners() {
            this._detachClientEventListeners();
            WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
        }

        _detachClientEventListeners() {
            WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
        }

        onActivate() {
            this._attachClientEventListeners();

            if (typeof this._currentNodeId === 'string') {
                WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
            }
        }

        onDeactivate() {
            this._detachClientEventListeners();
        }
    }

    return ElectricCircuitsEditorControl;
});
