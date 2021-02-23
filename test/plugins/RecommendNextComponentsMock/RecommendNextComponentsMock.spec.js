/*eslint-env node, mocha*/

describe('RecommendNextComponentsMock', function () {
    const testFixture = require('../../globals');
    const {promisify} = require('util');
    const gmeConfig = testFixture.getGmeConfig();
    const logger = testFixture.logger.fork('RecommendNextComponentsMock');
    const PluginCliManager = testFixture.WebGME.PluginCliManager;
    const manager = new PluginCliManager(null, logger, gmeConfig);
    const projectName = 'testProject';
    const pluginName = 'RecommendNextComponentsMock';
    const PROJECT_SEED = testFixture.testSeedPath;
    manager.runPluginMain = promisify(manager.runPluginMain);
    const assert = require('assert');

    let gmeAuth,
        storage,
        context,
        project,
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
        project = importResult.project;

        plugin = await manager.initializePlugin(pluginName);
        context = {
            project: project,
            commitHash: commitHash,
            branchName: 'master'
        };

    });

    after(async function () {
        await storage.closeDatabase();
        await gmeAuth.unload();
    });

    async function runPluginAndGetRecommendations(activeNode) {
        context.activeNode = activeNode;
        await manager.configurePlugin(plugin, pluginConfig, context);
        const result = await manager.runPluginMain(
            plugin
        );
        return await plugin.blobClient.getObjectAsJSON(
            result.artifacts.pop()
        );
    }

    describe('conversion', function (){
        Object.keys(testFixture.CIRCUITS).forEach(cktName => {
            it(`Should convert ${cktName}`, async () => {
                const recommendations = await runPluginAndGetRecommendations(testFixture.CIRCUITS[cktName]);
                assert(recommendations);
            });
        });
    });
});
