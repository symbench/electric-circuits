/*eslint-env node, mocha*/

describe('CreateElectricCircuitsMeta', function () {
    const testFixture = require('../../globals');
    const path = require('path');
    const {promisify} = require('util');
    const gmeConfig = testFixture.getGmeConfig();
    const logger = testFixture.logger.fork('CreateElectricCircuitsMeta');
    const PluginCliManager = testFixture.WebGME.PluginCliManager;
    const manager = new PluginCliManager(null, logger, gmeConfig);
    const projectName = 'testProject';
    const pluginName = 'CreateElectricCircuitsMeta';
    const PROJECT_SEED = path.join(testFixture.EC_SEED_DIR, 'projectBase', 'projectBase.webgmex');
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
            activeNode: '/1',
        };
    });

    after(async function () {
        await storage.closeDatabase();
        await gmeAuth.unload();
    });

    it('should run plugin and create new branch', async () => {
        const result = await manager.executePlugin(pluginName, pluginConfig, context);
        const branches = await project.getBranches();
        assert(Object.keys(branches).length === 2);
        assert(result.success);
    });

    it('should run plugin and update branch', async () => {
        pluginConfig.updateBranch = true;
        const result = await manager.executePlugin(pluginName, pluginConfig, context);
        const branches = await project.getBranches();
        assert(Object.keys(branches).length === 2);
        assert(result.success);
    });

});
