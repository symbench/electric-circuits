/*eslint-env node, mocha*/

describe('ConvertNetlistToCircuit', function () {
    this.timeout(5000);
    const testFixture = require('../../globals');
    const {promisify} = require('util');
    const {readFileSync} = require('fs');
    const path = require('path');
    const gmeConfig = testFixture.getGmeConfig();
    const logger = testFixture.logger.fork('ConvertNetlistToCircuit');
    const PluginCliManager = testFixture.WebGME.PluginCliManager;
    const manager = new PluginCliManager(null, logger, gmeConfig);
    const projectName = 'testProject';
    const pluginName = 'ConvertNetlistToCircuit';
    const PROJECT_SEED = testFixture.testSeedPath;
    manager.runPluginMain = promisify(manager.runPluginMain);
    const assert = require('assert');
    const fs = require('fs');
    const TEST_NETLIST_FILES = fs.readdirSync(
        testFixture.TEST_NETLISTS_PATH
    ).filter(file => file.endsWith('.net') || file.endsWith('.cir'));

    let gmeAuth,
        storage,
        context,
        pluginConfig,
        plugin;

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
        const project = importResult.project;

        plugin = await manager.initializePlugin(pluginName);
        context = {
            project: project,
            commitHash: commitHash,
            branchName: 'master',
            activeNode: testFixture.TEST_CIRCUITS_FOLDER
        };

        pluginConfig = {
            input_netlist: ''
        };
    });

    after(async function () {
        await storage.closeDatabase();
        await gmeAuth.unload();
    });

    async function runPlugin(fileName) {
        const netlistStr = readFileSync(
            path.join(testFixture.TEST_NETLISTS_PATH, fileName),
            'utf8'
        );

        pluginConfig.input_netlist = await plugin.blobClient.putFile(
            fileName,
            netlistStr
        );

        await manager.configurePlugin(plugin, pluginConfig, context);

        const result = await manager.runPluginMain(
            plugin
        );

        return result;
    }

    describe('circuit conversion', () => {
        TEST_NETLIST_FILES.forEach(filename => {
            it(`should convert ${filename} to Circuit`, async () => {
                assert((await runPlugin(filename)).success);
            });
        });
    });
});
