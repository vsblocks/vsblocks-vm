//THIS IS A TEST EXTENSION, AND AT NO POINT SHOULD IT BE ADDED TO THE EXTENSION MENU OR THE IMPORT LIST
const BlockType = require("../../extension-support/block-type")

class TESTEXTENSION {
  getInfo() {
    return {
      id: 'TESTEXTENSION', // change this if you make an actual extension!
      name: 'TESTEXTENSION',
      blocks: [
        {
          opcode: 'logBranch',
          blockType: BlockType.COMMAND,
          branchCount: 1,
          text: 'Log value of first block in branch',
        }
      ]
    };
  }
  logBranch(args, util) {
    if (util.thread.peekStack() && util.target.blocks.getBlock(util.thread.peekStack()) && util.target.blocks.getBlock(util.thread.peekStack()).inputs.SUBSTACK.block) {
      console.log(util.target.blocks.getBlock(util.thread.peekStack()).inputs.SUBSTACK.block)
    }
  }
}
module.exports = TESTEXTENSION
