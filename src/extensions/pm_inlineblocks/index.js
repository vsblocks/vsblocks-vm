const blocks = `
<block type="control_inline_stack_output">
    <value name="SUBSTACK">
        <block type="procedures_return">
            <value name="return">
            	<shadow type="text">
            		<field name="TEXT">1</field>
            	</shadow>
            </value>
        </block>
    </value>
</block>
`

/**
 * Class of 2024
 * @constructor
 */
class pmInlineBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {runtime}
         */
        this.runtime = runtime;
    }

    orderCategoryBlocks() {
        let categoryBlocks = blocks;

        // let idx = 0;
        // for (const block of extensionBlocks) {
        //     categoryBlocks = categoryBlocks.replace('%b' + idx + '>', block);
        //     idx++;
        // }

        return [categoryBlocks];
    }

    /**
     * @returns {object} metadata for deez nuts
     * this extension really only exists to seperate the block
     */
    getInfo() {
        return {
            id: 'pmInlineBlocks',
            name: 'Inline Blocks',
            color1: '#FFAB19',
            color2: '#EC9C13',
            color3: '#CF8B17',
            isDynamic: true,
            orderBlocks: this.orderCategoryBlocks,
            blocks: []
        };
    }
}

module.exports = pmInlineBlocks;
