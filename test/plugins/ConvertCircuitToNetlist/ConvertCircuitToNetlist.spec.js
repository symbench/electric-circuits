/*eslint-env node, mocha*/

describe('ConvertCircuitToNetlist', function () {
    const testFixture = require('../../globals');
    const path = require('path');
    const {promisify} = require('util');
    const gmeConfig = testFixture.getGmeConfig();
    const logger = testFixture.logger.fork('CreateElectricCircuitsMeta');
    const PluginCliManager = testFixture.WebGME.PluginCliManager;
    const manager = new PluginCliManager(null, logger, gmeConfig);
    const projectName = 'testProject';
    const pluginName = 'ConvertCircuitToNetlist';
    const PROJECT_SEED = path.join(testFixture.EC_SEED_DIR, 'project', 'project.webgmex');
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
            updateBranch: false
        };
        context = {
            project: project,
            commitHash: commitHash,
            branchName: 'master',
            activeNode: '/S/9',
        };
    });

    after(async function () {
        await storage.closeDatabase();
        await gmeAuth.unload();
    });

    it('should run plugin and update the branch', async  () => {
        // const result = await manager.executePlugin(pluginName, pluginConfig, context);
        // assert(result.success);
    });
});
