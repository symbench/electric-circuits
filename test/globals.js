/*jshint node:true*/

const testFixture = require('webgme/test/_globals'),
    WEBGME_CONFIG_PATH = '../config';

let WebGME = testFixture.WebGME,
    gmeConfig = require(WEBGME_CONFIG_PATH),
    getGmeConfig = function () {
        'use strict';
        // makes sure that for each request it returns with a unique object and tests will not interfere
        if (!gmeConfig) {
            // if some tests are deleting or unloading the config
            gmeConfig = require(WEBGME_CONFIG_PATH);
        }
        return JSON.parse(JSON.stringify(gmeConfig));
    };

WebGME.addToRequireJsPaths(gmeConfig);

testFixture.getGmeConfig = getGmeConfig;

testFixture.EC_SEED_DIR = testFixture.path.join(__dirname, '..', 'src', 'seeds');
testFixture.testSeedPath = testFixture.path.join(testFixture.EC_SEED_DIR, 'tests', 'tests.webgmex');

testFixture.CIRCUITS = {
    HPF: '/C/n',
    LPF: '/C/B',
    VoltageLimiter: '/e/M',
    PeakDetector: '/e/C',
    ClampedCapacitor: '/e/b',
    VoltageDoubler: '/e/I',
    CEAmplifier: '/i/R',
    NPNSwitch: '/i/b'
};

testFixture.TEST_CIRCUITS_FOLDER = '/0';
testFixture.TEST_NETLISTS_PATH = testFixture.path.join(__dirname, 'plugins', 'netlists');
testFixture.TEST_NETLISTS_ZIP = testFixture.path.join(__dirname, 'plugins', 'netlists.zip');

testFixture.getChildrenOfType = async function (core, node, type) {
    return (await core.loadChildren(node)).filter(child => {
        return core.getAttribute(core.getMetaType(child), 'name') === type;
    });
};

testFixture.getChildrenExcept = async function(core, node, types=[]) {
    return (await core.loadChildren(node)).filter(child => {
        return !types.includes(core.getAttribute(core.getMetaType(child), 'name'));
    });
};


module.exports = testFixture;
