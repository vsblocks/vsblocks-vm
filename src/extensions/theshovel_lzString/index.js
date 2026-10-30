// Created by TheShovel
// https://github.com/TheShovel
//
// 99% of the code here was not created by a PenguinMod developer!
// Look above for proper crediting :)

const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const { validateArray } = require('../../util/json-block-utilities');
const ArrayBufferUtil = require('../../util/array buffer');
const BufferParser = new ArrayBufferUtil();
const Cast = require("../../util/cast");
const LZString = require('lz-string');

class lzcompress {
    getInfo() {
        return {
            id: "shovellzcompresss",
            name: "LZ Compress",
            blocks: [
                {
                    opcode: "compress",
                    blockType: BlockType.REPORTER,
                    text: "compress [TEXT] to [TYPE]",
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello world!",
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: "COMPRESSIONTYPES",
                        },
                    },
                },
                {
                    opcode: "decompress",
                    blockType: BlockType.REPORTER,
                    text: "decompress [TEXT] from [TYPE]",
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "҅〶惶@✰Ӏ葀",
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: "COMPRESSIONTYPES",
                        },
                    },
                },
            ],
            menus: {
                COMPRESSIONTYPES: {
                    acceptReporters: true,
                    items: [
                        "Raw",
                        "Base64",
                        "EncodedURIComponent",
                        "ArrayBuffer",
                        "UTF16",
                    ],
                },
            },
        };
    }
    compress(args) {
        const text = Cast.toString(args.TEXT);
        if (args.TYPE == "Raw") {
            return LZString.compress(text);
        } else if (args.TYPE == "Base64") {
            return LZString.compressToBase64(text);
        } else if (args.TYPE == "EncodedURIComponent") {
            return LZString.compressToEncodedURIComponent(text);
        } else if (args.TYPE == "ArrayBuffer") {
            const uint8Array = LZString.compressToUint8Array(text);
            const buffer = BufferParser.uint8ArrayToBuffer(uint8Array);
            const array = BufferParser.bufferToArray(buffer);
            return JSON.stringify(array);
        } else if (args.TYPE == "UTF16") {
            return LZString.compressToUTF16(text);
        }
        return "";
    }

    decompress(args) {
        try {
            const text = Cast.toString(args.TEXT);
            if (args.TYPE == "Raw") {
                return LZString.decompress(text) || "";
            } else if (args.TYPE == "Base64") {
                return LZString.decompressFromBase64(text) || "";
            } else if (args.TYPE == "EncodedURIComponent") {
                return LZString.decompressFromEncodedURIComponent(text) || "";
            } else if (args.TYPE == "ArrayBuffer") {
                const array = validateArray(text);
                if (!array.isValid) return "";
                const buffer = BufferParser.arrayToBuffer(array.array);
                const uint8Array = BufferParser.bufferToUint8Array(buffer);
                return LZString.decompressFromUint8Array(uint8Array) || "";
            } else if (args.TYPE == "UTF16") {
                return LZString.decompressFromUTF16(text) || "";
            }
        } catch (e) {
            console.error("decompress error", e);
        }
        return "";
    }
}

module.exports = lzcompress;