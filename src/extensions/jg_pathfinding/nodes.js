const Clone = require('../../util/clone');

class Nodes {
    constructor(...args) {
        if (Array.isArray(args)) {
            if (Array.isArray(args[0])) {
                this._nodes = args;
                return;
            }
        }
        this._nodes = [];
        for (let node of args) {
            if (!Array.isArray(node)) node = [];
            if (typeof node[0] !== 'number') node[0] = 0;
            if (typeof node[1] !== 'number') node[1] = 0;
            this._nodes.push([
                Cast.toNumber(node[0]),
                Cast.toNumber(node[1])
            ]);
        }
    }

    push(node) {
        this._nodes.push(node);
    }

    getRaw() {
        return Clone.simple(this._nodes);
    }
    getAsObject() {
        const nodes = this.getRaw();
        const object = {};
        let idx = 0;
        for (const node of nodes) {
            const key = Cast.toString(idx + 1);
            object[key] = { x: node[0], y: node[1] };
            idx++;
        }
        return object;
    }
    getObjects() {
        const nodes = this.getRaw();
        const newArray = [];
        for (const node of nodes) {
            newArray.push({ x: node[0], y: node[1] });
        }
        return newArray;
    }
    getCommaSeperated() {
        const nodes = this.getRaw();
        const flattened = nodes.flat(Infinity);
        return flattened.join(',');
    }
}

module.exports = Nodes;