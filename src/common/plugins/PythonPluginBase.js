/*globals define*/

define([
    'plugin/PluginBase',
    'module'
], function (
    PluginBase,
    module
) {
    const START_PORT = 5555;
    const COMMAND = 'python';
    const path = require('path');
    const SCRIPT_FILE = path.join(path.dirname(module.uri), 'run_python_plugin.py');

    class PythonPluginBase extends PluginBase {
        constructor(pluginMetadata) {
            super();
            this.pluginMetadata = pluginMetadata;
        }

        async main(callback) {
            const CoreZMQ = require('webgme-bindings').CoreZMQ;

            // due to the limited options on the script return values, we need this hack
            this.result.setSuccess(null);

            const corezmq = new CoreZMQ(
                this.project,
                this.core,
                this.logger,
                { port: START_PORT, plugin: this}
            );

            const port = await corezmq.startServer();

            this.logger.info(`zmq-server listening at port ${port}`);

            try {
                await this.callScript(COMMAND, SCRIPT_FILE, port);
                await corezmq.stopServer();
                callback(null, this.result);
            } catch (err) {
                this.logger.error(err.stack);
                corezmq.stopServer()
                    .finally(() => {
                        // Result success is false at invocation.
                        callback(err, this.result);
                    });
            }
        }

        async callScript(program, scriptPath, port) {
            const cp = require('child_process');
            const config = this.getCurrentConfig();
            let options = {},
                args = [
                    scriptPath,
                    this.getId(),
                    port,
                    `"${this.commitHash}"`,
                    `"${this.branchName}"`,
                    `"${this.core.getPath(this.activeNode)}"`,
                    `"${this.activeSelection.map(node => this.core.getPath(node)).join(',')}"`,
                    `"${this.namespace}"`,
                    `'${JSON.stringify(config)}'`,
                ];

            const childProc = cp.spawn(program, args, options);

            return new Promise((resolve, reject) => {
                childProc.stdout.on('data', data => {
                    this.logger.info(data.toString());
                });

                childProc.stderr.on('data', data => {
                    this.logger.error(data.toString());
                });

                childProc.on('close', (code) => {
                    if (code > 0) {
                        // This means an execution error or crash, so we are failing the plugin
                        reject(new Error(`${program} ${args.join(' ')} exited with code ${code}.`));
                        this.result.setSuccess(false);
                    } else {
                        if(this.result.getSuccess() === null) {
                            // The result have not been set inside the python, but it suceeded, so we go with the true value
                            this.result.setSuccess(true);
                        }
                        resolve();
                    }
                });

                childProc.on('error', (err) => {
                    // This is a hard execution error, like the child process cannot be instantiated...
                    this.logger.error(err);
                    this.result.setSuccess(false);
                    reject(err);
                });
            });
        }
    }

    return PythonPluginBase;
});
