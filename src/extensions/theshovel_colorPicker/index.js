// Created by TheShovel
// https://github.com/TheShovel
//
// 99% of the code here was not created by a PenguinMod developer!
// Look above for proper crediting :)

const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const Cast = require("../../util/cast");

let input;

let x = 0;
let y = 0;
const updatePosition = () => {
    input.style.transform = `translate(${x}px, ${-y}px)`;
};

class ColorPicker {
    constructor(runtime) {
        this.runtime = runtime;

        input = document.createElement("input");
        input.type = "color";
        input.value = "#9966ff"; // default scratch-paint color
        input.style.pointerEvents = "none";
        input.style.width = "1px";
        input.style.height = "1px";
        input.style.visibility = "hidden";
        this.runtime.renderer.addOverlay(input, "scale-centered");

        input.addEventListener("input", () => {
            this.runtime.startHats("shovelColorPicker_whenChanged");
        });

        updatePosition();
    }

    getInfo() {
        return {
            id: "shovelColorPicker",
            name: "ColorPicker",
            color1: "#ff7db5",
            color2: "#e0649a",
            color3: "#c14d7f",
            blocks: [
                {
                    opcode: "showPicker",
                    blockType: BlockType.COMMAND,
                    text: "show color picker",
                },
                {
                    opcode: "setPos",
                    blockType: BlockType.COMMAND,
                    text: "set picker position to x: [X] y: [Y]",
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "setColor",
                    blockType: BlockType.COMMAND,
                    text: "set picker color to [COLOR]",
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: "#855CD6",
                        },
                    },
                },
                {
                    opcode: "getColor",
                    blockType: BlockType.REPORTER,
                    text: "color [TYPE] value",
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: "RGBMenu",
                        },
                    },
                },
                {
                    opcode: "getPos",
                    blockType: BlockType.REPORTER,
                    text: "picker [COORD] position",
                    arguments: {
                        COORD: {
                            type: ArgumentType.STRING,
                            menu: "POSMenu",
                        },
                    },
                },
                {
                    opcode: "whenChanged",
                    blockType: BlockType.EVENT,
                    isEdgeActivated: false,
                    text: "when color changed",
                },
            ],
            menus: {
                RGBMenu: {
                    acceptReporters: true,
                    items: ["hex", "red", "green", "blue"],
                },
                POSMenu: {
                    acceptReporters: true,
                    items: ["X", "Y"],
                },
            },
        };
    }

    setColor(args) {
        input.value = args.COLOR;
    }

    getColorHEX() {
        return input.value;
    }

    showPicker() {
        input.click();
    }

    getColor(args) {
        if (args.TYPE === "hex") {
            return input.value;
        } else if (args.TYPE == "red") {
            return Cast.toRgbColorObject(input.value).r;
        } else if (args.TYPE == "green") {
            return Cast.toRgbColorObject(input.value).g;
        } else if (args.TYPE == "blue") {
            return Cast.toRgbColorObject(input.value).b;
        } else {
            return "";
        }
    }

    setPos(args) {
        x = Cast.toNumber(args.X);
        y = Cast.toNumber(args.Y);
        updatePosition();
    }

    getPos(args) {
        if (args.COORD == "X") {
            return x;
        } else if (args.COORD == "Y") {
            return y;
        } else {
            return "";
        }
    }
}

module.exports = ColorPicker;