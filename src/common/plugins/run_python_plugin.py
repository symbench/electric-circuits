"""
This script is called by the plugin-wrapper, ConvertCircuitToNetlist.js, which passes down the
plugin context via arguments. These can be modified to include more information if needed.
Notes:
 - The current working directory when called from a plugin is the root of your webgme repo.
 - At the point of invocation of this plugin - it is assumed that a coreZMQ-server is running at 127.0.0.1:PORT.
 - For debugging use run_debug.py which starts coreZMQ-server (make sure to modify the context in run_debug.py first)
"""
import json
import logging
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from webgme_bindings import WebGME

WEBGME_SETUP = Path(f"{__file__}/../../../../webgme-setup.json").resolve()
IMPORT_MODULE_NAME = "electric_circuits.plugins"


def _import_python_class(plugin_file, class_name):
    spec = spec_from_file_location(IMPORT_MODULE_NAME, plugin_file)
    base_module = module_from_spec(spec)
    spec.loader.exec_module(base_module)

    return getattr(base_module, class_name)


def get_python_plugin_classes():
    plugin_classes = {}
    with open(WEBGME_SETUP, "r") as webgme_setup:
        plugins = json.load(webgme_setup)["components"]["plugins"]

        for plugin_name in plugins:
            plugin_file = Path(
                f"{__file__}/../../../../{plugins[plugin_name]['src']}/{plugin_name}/__init__.py"
            ).resolve()

            if plugin_file.exists():
                plugin_classes[plugin_name] = _import_python_class(
                    plugin_file, plugin_name
                )

    return plugin_classes


PLUGINS = get_python_plugin_classes()

if len(PLUGINS) == 0:
    raise Exception("No Python Plugins available in the current deployment")

logger = logging.getLogger(sys.argv[1])


logger.info("sys.args: {0}".format(sys.argv))

PORT = sys.argv[2]
COMMIT_HASH = sys.argv[3].strip('"')
BRANCH_NAME = sys.argv[4].strip('"')
ACTIVE_NODE_PATH = sys.argv[5].strip('"')
ACTIVE_SELECTION_PATHS = []

if sys.argv[6] != '""':
    ACTIVE_SELECTION_PATHS = sys.argv[6].strip('"').split(",")
    if ACTIVE_SELECTION_PATHS[0] == "":
        ACTIVE_SELECTION_PATHS.pop(0)

NAMESPACE = sys.argv[7].strip('"')


logger.debug("commit-hash: {0}".format(COMMIT_HASH))
logger.debug("branch-name: {0}".format(BRANCH_NAME))
logger.debug("active-node-path: {0}".format(ACTIVE_NODE_PATH))
logger.debug("active-selection-paths: {0}".format(ACTIVE_SELECTION_PATHS))
logger.debug("name-space: {0}".format(NAMESPACE))

# Create an instance of WebGME and the plugin
webgme = WebGME(PORT, logger)
plugin = PLUGINS[sys.argv[1]](
    webgme,
    COMMIT_HASH,
    BRANCH_NAME,
    ACTIVE_NODE_PATH,
    ACTIVE_SELECTION_PATHS,
    NAMESPACE,
)

# Do the work
plugin.main()

# Finally disconnect from the zmq-server
webgme.disconnect()
