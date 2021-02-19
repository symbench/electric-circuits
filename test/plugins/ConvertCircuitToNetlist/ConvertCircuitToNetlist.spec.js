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
    const BlobClient = testFixture.getBlobTestClient();
    const blobClient = new BlobClient(gmeConfig, logger);
    manager.executePlugin = promisify(manager.executePlugin);
    manager.runPluginMain = promisify(manager.runPluginMain);
    const assert = require('assert');

    let gmeAuth,
        storage,
        context,
        project,
        pluginConfig;

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
        pluginConfig = {
            file_name: null
        };
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

    async function runPluginAndReturnNetList(activeNode) {
        context.activeNode = activeNode;
        const result = await manager.executePlugin(
            pluginName,
            pluginConfig,
            context
        );
        return await blobClient.getObjectAsString(result.artifacts.pop());
    }

    describe('conversion', function (){
        Object.keys(testFixture.CIRCUITS).forEach(cktName => {
            it(`Should convert ${cktName}`, async () => {
                assert(await runPluginAndReturnNetList(testFixture.CIRCUITS[cktName]));
            });
        });
    });
});
