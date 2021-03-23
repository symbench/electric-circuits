const ActionApplier = require('webgme/src/client/lib/autorouter/action-applier.min');

class JointRouteManager extends ActionApplier {
    constructor() {
        super();
    }

    initialize() {
        super.init();

    }
}

module.exports = {
    JointRouteManager: JointRouteManager
};
