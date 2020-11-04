/*globals define, _, WebGMEGlobal*/
/*jshint browser: true*/
/**
 * @author Umesh Timalsina / https://github.com/umesh-timalsina
 */

'use strict';

define([], function () {
    const _metaID = 'ElectricCircuits.META.js',
        META_TYPES = {
            'Junction': 'Junction',
            'Component': 'Component',
            'Circuit': 'Circuit',
            'Port': 'Port',
            'Passive': 'Passive',
            'Resistor': 'Resistor',
            'Voltage': 'Voltage',
            'Current': 'Current',
            'Source': 'Source',
            'Transistor': 'Transistor',
            'PNP': 'PNP',
            'NPN': 'NPN'
        },
        DECORATED_META_TYPES = {
            'Resistor': 'Resistor'
        },
        client = WebGMEGlobal.Client;

    const _getMetaTypes = function () {
        const validMetaNodes = client.getAllMetaNodes()
            .filter(node => !!META_TYPES[node.getAttribute('name')]);

        let nodesDict = {};
        validMetaNodes.forEach(node => {
            nodesDict[node.getAttribute('name')] = node.getId();
        });

        return nodesDict;
    };

    const _getDecoratedMetaTypes = function () {
        const validDecoratedMetaNodes = client.getAllMetaNodes()
            .filter(node => !!DECORATED_META_TYPES[node.getAttribute('name')]);
        let nodesDict = {};
        validDecoratedMetaNodes.forEach(node => {
            nodesDict[node.getAttribute('name')] = node.getId();
        });

        return nodesDict;
    };

    const safeTypeCheck = function (id, metaId) {
        if(typeof metaId === 'string') {
            return client.isTypeOf(id, metaId);
        }
        return false;
    };

    const _getMetaTypesOf = function (objId) {
        const orderedMetaList = Object.keys(META_TYPES).sort(),
            metaDict = _getMetaTypes();
        return orderedMetaList.filter(node => safeTypeCheck(objId, metaDict[node]));
    };

    const _getMetaTypeOf = function (objId) {
        const node = client.getNode(objId);

        if (node) {
           const metaNode = client.getNode(node.getMetaTypeId());
           if(metaNode) {
               return metaNode.getAttribute('name');
           }
        }

        return null;
    };

    let _TYPE_INFO = {};

    Object.keys(META_TYPES).forEach(META_TYPE => {
        _TYPE_INFO[`is${META_TYPES[META_TYPE]}`] = function (objID) {
            return safeTypeCheck(objID, _getMetaTypes()[META_TYPES[META_TYPE]]);
        };
    });

    return {
        getMetaTypes: _getMetaTypes,
        getMetaTypesOf: _getMetaTypeOf,
        getDecoratedMetaTypes: _getDecoratedMetaTypes,
        getMetaTypeOf: _getMetaTypeOf,
        TYPE_INFO: _TYPE_INFO
    };

});

