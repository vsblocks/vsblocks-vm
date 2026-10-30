/**
 * Convert a part of a mutation DOM to a mutation VM object, recursively.
 * @param {object} dom DOM object for mutation tag.
 * @return {object} Object representing useful parts of this mutation.
 */
const mutatorTagToObject = function (dom) {
    if (dom.tagName === '#text') return dom.textContent
    const parseChildren = (obj, dom) => {
        for (let i = 0; i < dom.children.length; i++) {
            obj.children.push(
                mutatorTagToObject(dom.children[i])
            );
        }
        return obj.children[0];
    };
    let obj = Object.create(null);
    obj.tagName = dom.tagName;
    obj.children = [];
    if (!dom.tagName) {
        console.warn('invalid dom; skiping to reading children');
        obj = parseChildren(obj, dom);
        return obj;
    }
    for (let idx = 0; idx < dom.attributes.length; idx++) {
        const attrib = dom.attributes[idx];
        const attribName = attrib.name;
        if (attribName === 'xmlns') continue;
        obj[attribName] = attrib.value;
        // Note: the capitalization of block info in the following lines is important.
        // The lowercase is read in from xml which normalizes case. The VM uses camel case everywhere else.
        if (attribName === 'blockinfo') {
            obj.blockInfo = JSON.parse(obj.blockinfo);
            delete obj.blockinfo;
        }
    }

    parseChildren(obj, dom);
    return obj;
};

/**
 * Adapter between mutator XML or DOM and block representation which can be
 * used by the Scratch runtime.
 * @param {(object|string)} mutation Mutation XML string or DOM.
 * @return {object} Object representing the mutation.
 */
const mutationAdpater = function (mutation) {
    let mutationParsed;
    // Check if the mutation is already parsed; if not, parse it.
    if (typeof mutation === 'object') {
        mutationParsed = mutation;
    } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(mutation, "application/xml");
        mutationParsed = doc;
        if (mutationParsed.nodeName === '#document') {
            mutationParsed = mutationParsed.children[0];
        }
    }
    
    return mutatorTagToObject(mutationParsed);
};

module.exports = mutationAdpater;
