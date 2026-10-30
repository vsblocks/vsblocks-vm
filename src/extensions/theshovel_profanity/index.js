// Created by TheShovel
// https://github.com/TheShovel
//
// 99% of the code here was not created by a PenguinMod developer!
// Look above for proper crediting :)

const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const Cast = require("../../util/cast");

class profanityAPI {
    getInfo() {
        return {
            id: "profanityAPI",
            name: "Censorship",
            blocks: [
                {
                    opcode: "checkProfanity",
                    blockType: BlockType.REPORTER,
                    disableMonitor: false,
                    text: "remove profanity from [TEXT]",
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello, I love pizza!",
                        },
                    },
                },
            ],
        };
    }

    checkProfanity({ TEXT }) {
        const text = encodeURIComponent(Cast.toString(TEXT));
        return fetch(`https://www.purgomalum.com/service/plain?text=${text}`)
            .then((r) => r.text())
            .catch(() => "");
    }
}

module.exports = profanityAPI;