class ModalManager {
    constructor (runtime) {
        this.runtime = runtime;
        this.modals = {};
        this._updateId = 0;
    }
    updateModalComponents () {
        this._updateId++;
        if (this._updateId > 1000000) {
            this._updateId = 0;
        }
    }

    createModal (id, config) {
        this.modals[id] = {
            ...config,
            id
        };
        this.updateModalComponents();
    }
    deleteModal (id) {
        if (id in this.modals) {
            delete this.modals[id];
        }
        this.updateModalComponents();
    }
}

module.exports = ModalManager;