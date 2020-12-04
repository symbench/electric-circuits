/*
 * Copyright (C) 2020 Vanderbilt University, All rights reserved.
 *
 * Authors:
 * Umesh Timalsina
 */
/*globals define, _, WebGMEGlobal*/
/*eslint-env browser*/

'use strict';

define([], function () {
    const _metaID = 'ElectricCircuits.META.js',
        META_TYPES = {
            'ElectricCircuitsFolder': 'ElectricCircuitsFolder',
            'Junction': 'Junction',
            'Component': 'Component',
            'Circuit': 'Circuit',
            'Port': 'Port',
            'Pin': 'Pin',
            'Ground': 'Ground',
            'Passive': 'Passive',
            'Resistor': 'Resistor',
            'Voltage': 'Voltage',
            'Current': 'Current',
            'Source': 'Source',
            'Transistor': 'Transistor',
            'PNP': 'PNP',
            'NPN': 'NPN',
            'VCC': 'VCC',
            'VCV': 'VCV',
            'CCC': 'CCC',
            'CCV': 'CCV',
            'Diode': 'Diode',
            'ZDiode': 'ZDiode',
            'Capacitor': 'Capacitor',
            'Inductor': 'Inductor',
            'NMOS': 'NMOS',
            'PMOS': 'PMOS',
            'OpAmp': 'OpAmp',
            'OpAmpDetailed': 'OpAmpDetailed',
            'Potentiometer': 'Potentiometer',
            'Gyrator': 'Gyrator',
            'Transformer': 'Transformer',
            'LED': 'LED',
            'SchottkyDiode': 'SchottkyDiode'

        },
        DECORATED_META_TYPES = {
            'Resistor': 'Resistor',
            'ElectricCircuitsFolder': 'ElectricCircuitsFolder',
            'Potentiometer': 'Potentiometer',
            'NPN': 'NPN',
            'PNP': 'PNP',
            'NMOS': 'NMOS',
            'Pin': 'Pin',
            'PMOS': 'PMOS',
            'Ground': 'Ground',
            'Diode': 'Diode',
            'Circuit': 'Circuit',
            'Voltage': 'Voltage',
            'Current': 'Current',
            'Junction': 'Junction',
            'Port': 'Port',
            'VCV': 'VCV',
            'VCC': 'VCC',
            'CCC': 'CCC',
            'CCV': 'CCV',
            'OpAmp': 'OpAmp',
            'OpAmpDetailed': 'OpAmpDetailed',
            'Capacitor': 'Capacitor',
            'Inductor': 'Inductor',
            'ZDiode': 'ZDiode',
            'Gyrator': 'Gyrator',
            'Transformer': 'Transformer',
            'LED': 'LED',
            'SchottkyDiode': 'SchottkyDiode'
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
        if (typeof metaId === 'string') {
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
            if (metaNode) {
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

    _TYPE_INFO.isTwoTerm = function (objID) {
        const META_TYPES = _getMetaTypes();
        const twoTermMetaTypes = [
            META_TYPES.Resistor,
            META_TYPES.Voltage,
            META_TYPES.Current,
            META_TYPES.Diode,
            META_TYPES.Capacitor,
            META_TYPES.Inductor,
            META_TYPES.ZDiode,
            META_TYPES.LED,
            META_TYPES.S
        ];
        for (let metaType of twoTermMetaTypes) {
            if (safeTypeCheck(objID, metaType)) {
                return true;
            }
        }
        return false;
    };

    _TYPE_INFO.isThreeTerm = function (objID) {
        const META_TYPES = _getMetaTypes();
        const threeTermMetaTypes = [
            META_TYPES.NPN,
            META_TYPES.PNP
        ];

        for (let metaType of threeTermMetaTypes) {
            if (safeTypeCheck(objID, metaType)) {
                return true;
            }
        }
        return false;
    };

    _TYPE_INFO.isOneTerm = function (objID) {
        const META_TYPES = _getMetaTypes();
        const oneTermMetaTypes = [
            META_TYPES.Ground
        ];

        for (let metaType of oneTermMetaTypes) {
            if (safeTypeCheck(objID, metaType)) {
                return true;
            }
        }
        return false;
    };

    _TYPE_INFO.isFourTerm = function (objID) {
        const META_TYPES = _getMetaTypes();
        const fourTermMetaTypes = [
            META_TYPES.Gyrator,
            META_TYPES.Transformer,
            META_TYPES.CCC,
            META_TYPES.CCV,
            META_TYPES.VCV,
            META_TYPES.VCC
        ];

        for (let metaType of fourTermMetaTypes) {
            if (safeTypeCheck(objID, metaType)) {
                return true;
            }
        }
        return false;
    };

    _TYPE_INFO.isVertical = function (objID) {
        const META_TYPES = _getMetaTypes();
        const verticalMetaTypes = [
            META_TYPES.Voltage,
            META_TYPES.Current
        ];
        for (let metaType of verticalMetaTypes) {
            if (safeTypeCheck(objID, metaType)) {
                return true;
            }
        }
        return false;
    };

    return {
        getMetaTypes: _getMetaTypes,
        getMetaTypesOf: _getMetaTypeOf,
        getDecoratedMetaTypes: _getDecoratedMetaTypes,
        getMetaTypeOf: _getMetaTypeOf,
        TYPE_INFO: _TYPE_INFO
    };

});

