"""
This script is called by the plugin-wrapper, ConvertCircuitToNetlist.js, which passes down the
plugin context via arguments. These can be modified to include more information if needed.
Notes:
 - The current working directory when called from a plugin is the root of your webgme repo.
 - At the point of invocation of this plugin - it is assumed that a coreZMQ-server is running at 127.0.0.1:PORT.
 - For debugging use run_debug.py which starts coreZMQ-server (make sure to modify the context in run_debug.py first)
"""

import sys
import logging
from webgme_bindings import WebGME
from ConvertCircuitToNetlist import ConvertCircuitToNetlist

logger = logging.getLogger("ConvertCircuitToNetlist")

# Read in the context from sys.argv passed by the plugin
logger.info("sys.args: {0}".format(sys.argv))

PORT = sys.argv[1]
COMMIT_HASH = sys.argv[2].strip('"')
BRANCH_NAME = sys.argv[3].strip('"')
ACTIVE_NODE_PATH = sys.argv[4].strip('"')
ACTIVE_SELECTION_PATHS = []

if sys.argv[5] != '""':
    ACTIVE_SELECTION_PATHS = sys.argv[5].strip('"').split(",")
    if ACTIVE_SELECTION_PATHS[0] == "":
        ACTIVE_SELECTION_PATHS.pop(0)

NAMESPACE = sys.argv[6].strip('"')

logger.debug("commit-hash: {0}".format(COMMIT_HASH))
logger.debug("branch-name: {0}".format(BRANCH_NAME))
logger.debug("active-node-path: {0}".format(ACTIVE_NODE_PATH))
logger.debug("active-selection-paths: {0}".format(ACTIVE_SELECTION_PATHS))
logger.debug("name-space: {0}".format(NAMESPACE))

# Create an instance of WebGME and the plugin
webgme = WebGME(PORT, logger)
plugin = ConvertCircuitToNetlist(
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
