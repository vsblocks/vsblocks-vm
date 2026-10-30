const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const Color = require('../../util/color');
const {validateJSON} = require('../../util/json-block-utilities');
const Cast = require('../../util/cast');

/**
 * Class for TurboWarp blocks
 * @constructor
 */
class colorBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    deafultHsv = '{"h": 360, "s": 1, "v": 1}';
    deafultRgb = '{"r": 255, "g": 0, "b": 0}';
    deafultHex = '#ff0000';
    deafultDecimal = '16711680';

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'colors',
            name: 'Colors',
            color1: '#ff4c4c',
            color2: '#e64444',
            blocks: [
                {
                    opcode: 'colorPicker',
                    text: '[OUTPUT] of [COLOR]',
                    disableMonitor: true,
                    arguments: {
                        OUTPUT: {
                            type: ArgumentType.STRING,
                            menu: "outputColorType"
                        },
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'defaultBlack',
                    text: 'black',
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'defaultWhite',
                    text: 'white',
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    blockType: BlockType.LABEL,
                    text: 'RGB'
                },
                {
                    opcode: 'rgbToDecimal',
                    text: 'rgb [color] to decimal',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultRgb
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'rgbToHex',
                    text: 'rgb [color] to hex',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultRgb
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'rgbToHsv',
                    text: 'rgb [color] to hsv',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultRgb
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    blockType: BlockType.LABEL,
                    text: 'Hex'
                },
                {
                    opcode: 'hexToDecimal',
                    text: 'hex [color] to decimal',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultHex
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'hexToRgb',
                    text: 'hex [color] to rgb',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultHex
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'hexToHsv',
                    text: 'hex [color] to hsv',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultHex
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    blockType: BlockType.LABEL,
                    text: 'Decimal'
                },
                {
                    opcode: 'decimalToHex',
                    text: 'decimal [color] to hex',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultDecimal
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'decimalToRgb',
                    text: 'decimal [color] to rgb',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultDecimal
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'decimalToHsv',
                    text: 'decimal [color] to hsv',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultDecimal
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    blockType: BlockType.LABEL,
                    text: 'HSV'
                },
                {
                    opcode: 'hsvToHex',
                    text: 'hsv [color] to hex',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultHsv
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'hsvToRgb',
                    text: 'hsv [color] to rgb',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultHsv
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'hsvToDecimal',
                    text: 'hsv [color] to decimal',
                    arguments: {
                        color: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultHsv
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                "---",
                {
                    blockType: BlockType.LABEL,
                    text: 'Other'
                },
                {
                    opcode: 'csbMaker',
                    text: 'color: [h] saturation: [s] brightness: [v] transparency: [a]',
                    arguments: {
                        h: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        s: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        v: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        a: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'hsvMaker',
                    text: 'h: [h] s: [s] v: [v] a: [a]',
                    arguments: {
                        h: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        s: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        v: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        a: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'rgbMaker',
                    text: 'r: [r] g: [g] b: [b] a: [a]',
                    arguments: {
                        r: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        g: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        b: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        },
                        a: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '50'
                        }
                    },
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'mixColors',
                    text: 'mix [color1] [color2] by [percent]',
                    arguments: {
                        color1: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultRgb
                        },
                        color2: {
                            type: ArgumentType.STRING,
                            defaultValue: this.deafultRgb
                        },
                        percent: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0.5'
                        }
                    },
                    blockType: BlockType.REPORTER
                }
            ],
            menus: {
                outputColorType: {
                    items: [
                        { text: 'decimal', value: "decimal" },
                        { text: 'rgb', value: "rgb" },
                        { text: 'hsv', value: "hsv" },
                        { text: 'hex', value: "hex" }
                    ],
                    acceptReporters: true
                }
            }
        };
    }

    defaultBlack () {
        return JSON.stringify(Color.RGB_BLACK);
    }
    defaultWhite () {
        return JSON.stringify(Color.RGB_WHITE);
    }

    colorPicker (args) {
        const color = Color.hexToDecimal(args.COLOR);
        const argsColor = { color: color };
        switch (Cast.toString(args.OUTPUT).toLowerCase()) {
        case "rgb":
            return this.decimalToRgb(argsColor);
        case "hsv":
            return this.decimalToHsv(argsColor);
        case "hex":
            // todo: args.COLOR is already hex now
            return this.decimalToHex(argsColor);
        default:
            return color;
        }
    }

    csbMaker (args) {
        const color = {
            h: args.h * 360 / 100,
            s: args.s / 100,
            v: args.v / 100
        };
        if (!isNaN(args.a)) color.a = args.a / 100;
        return JSON.stringify(color);
    }
    hsvMaker (args) {
        const color = {
            h: args.h,
            s: args.s,
            v: args.v
        };
        if (!isNaN(args.a)) color.a = args.a;
        return JSON.stringify(color);
    }
    rgbMaker (args) {
        const color = {
            r: args.r,
            g: args.g,
            b: args.b
        };
        if (!isNaN(args.a)) color.a = args.a;
        return JSON.stringify(color);
    }
    mixColors (args) {
        const color1 = validateJSON(args.color1).object;
        const color2 = validateJSON(args.color2).object;
        return JSON.stringify(Color.mixRgb(color1, color2, args.percent));
    }

    rgbToDecimal (args) {
        const color = validateJSON(args.color).object;
        return Color.rgbToDecimal(color);
    }
    rgbToHex (args) {
        const color = validateJSON(args.color).object;
        return Color.rgbToHex(color);
    }
    rgbToHsv (args) {
        const color = validateJSON(args.color).object;
        return JSON.stringify(Color.rgbToHsv(color));
    }
    hexToDecimal (args) {
        const color = args.color;
        return Color.hexToDecimal(color);
    }
    hexToRgb (args) {
        const color = Color.hexToRgb(args.color);
        return JSON.stringify(color);
    }
    hexToHsv (args) {
        const color = Color.hexToRgb(args.color);
        return JSON.stringify(Color.rgbToHsv(color));
    }
    decimalToHex (args) {
        const color = Number(args.color);
        return Color.decimalToHex(color);
    }
    decimalToRgb (args) {
        const color = Color.decimalToRgb(Number(args.color));
        return JSON.stringify(color);
    }
    decimalToHsv (args) {
        const color = Color.decimalToRgb(Number(args.color));
        return JSON.stringify(Color.rgbToHsv(color));
    }
    hsvToHex (args) {
        const color = Color.hsvToRgb(validateJSON(args.color).object);
        return Color.rgbToHex(color);
    }
    hsvToRgb (args) {
        const color = Color.hsvToRgb(validateJSON(args.color).object);
        return JSON.stringify(color);
    }
    hsvToDecimal (args) {
        const color = Color.hsvToRgb(validateJSON(args.color).object);
        return Color.rgbToDecimal(color);
    }
}

module.exports = colorBlocks;
