/*eslint-env node, mocha*/

describe('ConvertCircuitToNetlist', function () {
    const testFixture = require('../../globals');
    const {promisify} = require('util');
    const gmeConfig = testFixture.getGmeConfig();
    const logger = testFixture.logger.fork('ConvertCircuitToNetlist');
    const PluginCliManager = testFixture.WebGME.PluginCliManager;
    const manager = new PluginCliManager(null, logger, gmeConfig);
    const projectName = 'testProject';
    const pluginName = 'ConvertCircuitToNetlist';
    const PROJECT_SEED = testFixture.testSeedPath;
    manager.runPluginMain = promisify(manager.runPluginMain);
    const assert = require('assert');
    const {spawnSync} = require('child_process');
    const PYSPICE_SCRIPT = testFixture.path.resolve(__dirname, 'netlist_to_json.py');

    let gmeAuth,
        storage,
        context,
        project,
        pluginConfig,
        plugin,
        core;

    before(async function () {
        gmeAuth = await testFixture.clearDBAndGetGMEAuth(gmeConfig, projectName);
        storage = testFixture.getMemoryStorage(logger, gmeConfig, gmeAuth);
        await storage.openDatabase();
        const importParam = {
            projectSeed: PROJECT_SEED,
            projectName: projectName,
            branchName: 'master',
            logger: logger,
            gmeConfig: gmeConfig
        };

        const importResult = await testFixture.importProject(storage, importParam);
        const commitHash = importResult.commitHash;
        project = importResult.project;

        plugin = await manager.initializePlugin(pluginName);
        context = {
            project: project,
            commitHash: commitHash,
            branchName: 'master'
        };

        pluginConfig = {
            file_name: null
        };

    });

    after(async function () {
        await storage.closeDatabase();
        await gmeAuth.unload();
    });

    function arrayEquals(arr1, arr2) {
        return Array.isArray(arr1) &&
            Array.isArray(arr2) &&
            arr1.length === arr2.length &&
            arr1.every((val, index) => val === arr2[index]);
    }

    async function runPluginAndReturnNetlist(activeNode) {
        context.activeNode = activeNode;
        await manager.configurePlugin(plugin, pluginConfig, context);
        core = plugin.core;
        const result = await manager.runPluginMain(
            plugin
        );
        return await plugin.blobClient.getObjectAsString(
            result.artifacts.pop()
        );
    }

    async function getElementNamesFor(circuit) {
        return (await testFixture.getChildrenExcept(
            core,
            circuit,
            ['Wire', 'Pin', 'Ground', 'Junction', 'Circuit']
        )).map(child => core.getAttribute(child, 'name'));
    }

    async function assertValidNetlist(netlist, circuitNode) {
        assert(circuitNode);
        const pySpiceProcess = spawnSync('python', [PYSPICE_SCRIPT, netlist]);
        const netlistJSON = JSON.parse(pySpiceProcess.stdout.toString());

        const subCircuits = await testFixture.getChildrenOfType(
            core,
            circuitNode,
            'Circuit'
        );

        const elements = await getElementNamesFor(circuitNode);

        for (let subCircuit of subCircuits) {
            const subCircuitName = core.getAttribute(subCircuit, 'name');
            const subCircuitInNetlist = netlistJSON.sub_circuits
                .find(sub_ckt => sub_ckt.name === subCircuitName);

            const subCircuitElements = await getElementNamesFor(subCircuit);

            assert(subCircuitInNetlist);
            assert(arrayEquals(subCircuitElements.sort(), Object.keys(subCircuitInNetlist.nodes).sort()));
        }

        assert(subCircuits.length === netlistJSON.sub_circuits.length);
        assert(arrayEquals(elements.sort(), Object.keys(netlistJSON.nodes).sort()));
    }

    describe('conversion', function (){
        Object.keys(testFixture.CIRCUITS).forEach(cktName => {
            it(`Should convert ${cktName}`, async () => {
                const netlist = await runPluginAndReturnNetlist(testFixture.CIRCUITS[cktName]);
                await assertValidNetlist(netlist, plugin.activeNode);
            });
        });
    });
});
