const mutationAdapter = require('./mutation-adapter');
const uid = require('../util/uid');

/**
 * Convert and an individual block DOM to the representation tree.
 * Based on Blockly's `domToBlockHeadless_`.
 * @param {Element} blockDOM DOM tree for an individual block.
 * @param {object} blocks Collection of blocks to add to.
 * @param {boolean} isTopBlock Whether blocks at this level are "top blocks."
 * @param {?string} parent Parent block ID.
 * @return {undefined}
 */
const domToBlock = function (blockDOM, blocks, isTopBlock, parent) {
    if (!blockDOM.attributes.id) {
        blockDOM.attributes.id = {};
        blockDOM.attributes.id.value = uid();
    }

    // make sure errors arnt thrown when there is no postion
    blockDOM.attributes.x ??= {};
    blockDOM.attributes.y ??= {};

    // Block skeleton.
    const block = {
        id: blockDOM.attributes.id.value, // Block ID
        opcode: blockDOM.attributes.type.value, // For execution, "event_whengreenflag".
        inputs: {}, // Inputs to this block and the blocks they point to.
        fields: {}, // Fields on this block and their values.
        next: null, // Next block in the stack, if one exists.
        topLevel: isTopBlock, // If this block starts a stack.
        parent: parent, // Parent block ID, if available.
        shadow: blockDOM.tagName === 'shadow', // If this represents a shadow/slot.
        x: blockDOM.attributes.x.value, // X position of script, if top-level.
        y: blockDOM.attributes.y.value // Y position of script, if top-level.
    };

    // Add the block to the representation tree.
    blocks[block.id] = block;

    // Process XML children and find enclosed blocks, fields, etc.
    for (let i = 0; i < blockDOM.children.length; i++) {
        const xmlChild = blockDOM.children[i];
        // Enclosed blocks and shadows
        let childBlockNode = null;
        let childShadowNode = null;
        for (let j = 0; j < xmlChild.children.length; j++) {
            const grandChildNode = xmlChild.children[j];
            if (!grandChildNode.tagName) {
                // Non-XML tag node.
                continue;
            }
            const grandChildNodeName = grandChildNode.tagName;
            if (grandChildNodeName === 'block') {
                childBlockNode = grandChildNode;
            } else if (grandChildNodeName === 'shadow') {
                childShadowNode = grandChildNode;
            }
        }

        // Use shadow block only if there's no real block node.
        if (!childBlockNode && childShadowNode) {
            childBlockNode = childShadowNode;
        }

        // Not all Blockly-type blocks are handled here,
        // as we won't be using all of them for Scratch.
        switch (xmlChild.tagName) {
        case 'field':
        {
            // Add the field to this block.
            const fieldName = xmlChild.attributes.name.value;
            // make sure the id exists and is valid nomatter what
            xmlChild.attributes.id ??= { value: uid() };
            // Add id in case it is a variable field
            const fieldId = xmlChild.attributes.id.value;
            let fieldData = '';
            if (xmlChild.innerHTML) {
                fieldData = xmlChild.textContent;
            } else {
                // If the child of the field with a data property
                // doesn't exist, set the data to an empty string. 
                fieldData = '';
            }
            block.fields[fieldName] = {
                name: fieldName,
                id: fieldId,
                value: fieldData
            };
            xmlChild.attributes.variabletype ??= {};
            const fieldVarType = xmlChild.attributes.variabletype.value;
            if (typeof fieldVarType === 'string') {
                block.fields[fieldName].variableType = fieldVarType;
            }
            break;
        }
        case 'comment':
        {
            block.comment = xmlChild.attributes.id.value;
            break;
        }
        case 'value':
        case 'statement':
        {
            // Recursively generate block structure for input block.
            domToBlock(childBlockNode, blocks, false, block.id);
            if (childShadowNode && childBlockNode !== childShadowNode) {
                // Also generate the shadow block.
                domToBlock(childShadowNode, blocks, false, block.id);
            }
            // Link this block's input to the child block.
            const inputName = xmlChild.attributes.name.value;
            block.inputs[inputName] = {
                name: inputName,
                block: childBlockNode.attributes.id.value,
                shadow: childShadowNode ? childShadowNode.attributes.id.value : null
            };
            break;
        }
        case 'next':
        {
            if (!childBlockNode || !childBlockNode.attributes) {
                // Invalid child block.
                continue;
            }
            // Recursively generate block structure for next block.
            domToBlock(childBlockNode, blocks, false, block.id);
            // Link next block to this block.
            block.next = childBlockNode.attributes.id.value;
            break;
        }
        case 'mutation':
        {
            block.mutation = mutationAdapter(xmlChild);
            break;
        }
        }
    }
};

/**
 * Convert outer blocks DOM from a Blockly CREATE event
 * to a usable form for the Scratch runtime.
 * This structure is based on Blockly xml.js:`domToWorkspace` and `domToBlock`.
 * @param {Element} blocksDOM DOM tree for this event.
 * @return {Array.<object>} Usable list of blocks from this CREATE event.
 */
const domToBlocks = function (blocksDOM) {
    // At this level, there could be multiple blocks adjacent in the DOM tree.
    const blocks = {};
    for (let i = 0; i < blocksDOM.length; i++) {
        const block = blocksDOM[i];

        if (!block.tagName || !block.attributes) {
            continue;
        }
        const tagName = block.tagName;
        if (tagName === 'block' || tagName === 'shadow') {
            domToBlock(block, blocks, true, null);
        }
    }
    // Flatten blocks object into a list.
    const blocksList = [];
    for (const b in blocks) {
        if (!blocks.hasOwnProperty(b)) continue;
        blocksList.push(blocks[b]);
    }
    return blocksList;
};

/**
 * Adapter between block creation events and block representation which can be
 * used by the Scratch runtime.
 * @param {object} e `Blockly.events.create` or `Blockly.events.endDrag`
 * @return {Array.<object>} List of blocks from this CREATE event.
 */
const adapter = function (e) {
    // Validate input
    if (typeof e !== 'object') return;
    if (typeof e.xml !== 'object') return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(e.xml.outerHTML, "application/xml");
    return domToBlocks(doc.childNodes);
};

module.exports = adapter;
