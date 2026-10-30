// Created by TheShovel
// https://github.com/TheShovel
//
// Extra modifications: (their names will be listed nearby their changes for convenience)
//      SharkPool
//      https://github.com/SharkPool-SP
//
// 99% of the code here was not created by a PenguinMod developer!
// Look above for proper crediting :)

const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const Cast = require("../../util/cast");

let borderRadius = 0;
let rotation = 0;
let offsetY = 0;
let offsetX = 0;
let skewY = 0;
let skewX = 0;
let scale = 100;

// Thanks SharkPool for telling me about these
let transparency = 0;
let sepia = 0;
let blur = 0;
let contrast = 100;
let saturation = 100;
let color = 0;
let brightness = 100;
let invert = 0;
let resizeMode = "default";

// SharkPool
let imageC = ["", 100];
let borderC = [0, "none", "#ff0000", "transparent"];

let canvas;
const updateStyle = () => {
    // Gotta keep the translation to % because of the stage size, window size and so on
    const transform = `rotate(${rotation}deg) scale(${scale}%) skew(${skewX}deg, ${skewY}deg) translate(${offsetX}%, ${
        0 - offsetY
    }%)`;
    if (canvas.style.transform !== transform) {
        canvas.style.transform = transform;
    }
    const filter = `blur(${blur}px) contrast(${
        contrast / 100
    }) saturate(${saturation}%) hue-rotate(${color}deg) brightness(${brightness}%) invert(${invert}%) sepia(${sepia}%) opacity(${
        100 - transparency
    }%)`;
    if (canvas.style.filter !== filter) {
        canvas.style.filter = filter;
    }
    const cssBorderRadius = borderRadius === 0 ? "" : `${borderRadius}%`;
    if (canvas.style.borderRadius !== cssBorderRadius) {
        canvas.style.borderRadius = cssBorderRadius;
    }
    const imageRendering = resizeMode === "pixelated" ? "pixelated" : "";
    if (canvas.style.imageRendering !== imageRendering) {
        canvas.style.imageRendering = imageRendering;
    }
    // SharkPool
    canvas.style.border = Cast.toString(
        `${borderC[0]}px ${borderC[1]} ${borderC[2]}`
    );
    canvas.style.backgroundColor = Cast.toString(borderC[3]);
    if (imageC[0].length > 3) {
        canvas.style.backgroundImage = imageC[0];
        canvas.style.backgroundSize = `${Cast.toNumber(imageC[1])}%`;
    }
};

class CanvasEffects {
    constructor(runtime) {
        this.runtime = runtime;
        this.canvas = runtime.renderer.canvas;
        canvas = this.canvas;
        // scratch-gui may reset canvas styles when resizing the window or going in/out of fullscreen
        new MutationObserver(updateStyle).observe(this.canvas, {
            attributeFilter: ["style"],
            attributes: true,
        });
        this.runtime.on("RUNTIME_DISPOSED", this.cleareffects);
    }

    getInfo() {
        return {
            id: "theshovelcanvaseffects",
            name: "Canvas Effects",
            blocks: [
                {
                    opcode: "seteffect",
                    blockType: BlockType.COMMAND,
                    text: "set canvas [EFFECT] to [NUMBER]",
                    arguments: {
                        EFFECT: {
                            type: ArgumentType.STRING,
                            menu: "EFFECTMENU",
                        },
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                        },
                    },
                },
                {
                    opcode: "changeEffect",
                    blockType: BlockType.COMMAND,
                    text: "change canvas [EFFECT] by [NUMBER]",
                    arguments: {
                        EFFECT: {
                            type: ArgumentType.STRING,
                            menu: "EFFECTMENU",
                        },
                        NUMBER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                    },
                },
                {
                    opcode: "geteffect",
                    blockType: BlockType.REPORTER,
                    text: "get canvas [EFFECT]",
                    arguments: {
                        EFFECT: {
                            type: ArgumentType.STRING,
                            menu: "EFFECTGETMENU",
                        },
                    },
                },
                {
                    opcode: "setBorder",
                    blockType: BlockType.COMMAND,
                    text: "add [BORDER] border to canvas with color [COLOR1] and backup [COLOR2] and thickness [THICK]",
                    arguments: {
                        BORDER: {
                            type: ArgumentType.STRING,
                            menu: "BORDERTYPES",
                        },
                        THICK: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5,
                        },
                        COLOR1: {
                            type: ArgumentType.COLOR,
                            defaultValue: "#ff0000",
                        },
                        COLOR2: {
                            type: ArgumentType.COLOR,
                            defaultValue: "#0000ff",
                        },
                    },
                },
                {
                    opcode: "setImage",
                    blockType: BlockType.COMMAND,
                    text: "set canvas image to [IMAGE] scaled [AMT]%",
                    hideFromPalette: true, // only appears when stage BG is transparent
                    arguments: {
                        IMAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: "https://extensions.turbowarp.org/dango.png",
                        },
                        AMT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                    },
                },
                {
                    opcode: "cleareffects",
                    blockType: BlockType.COMMAND,
                    text: "clear canvas effects",
                },
                {
                    opcode: "renderscale",
                    blockType: BlockType.COMMAND,
                    text: "set canvas render size to width:[X] height:[Y]",
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                    },
                },
                {
                    opcode: "setrendermode",
                    blockType: BlockType.COMMAND,
                    text: "set canvas resize rendering mode [EFFECT]",
                    arguments: {
                        EFFECT: {
                            type: ArgumentType.STRING,
                            menu: "RENDERMODE",
                        },
                    },
                },
            ],
            menus: {
                EFFECTMENU: {
                    acceptReporters: true,
                    items: [
                        "blur",
                        "contrast",
                        "saturation",
                        "color shift",
                        "brightness",
                        "invert",
                        "sepia",
                        "transparency",
                        "scale",
                        "skew X",
                        "skew Y",
                        "offset X",
                        "offset Y",
                        "rotation",
                        "border radius",
                    ],
                },
                RENDERMODE: {
                    acceptReporters: true,
                    items: ["pixelated", "default"],
                },
                EFFECTGETMENU: {
                    acceptReporters: true,
                    // this contains 'resize rendering mode', EFFECTMENU does not
                    items: [
                        "blur",
                        "contrast",
                        "saturation",
                        "color shift",
                        "brightness",
                        "invert",
                        "resize rendering mode",
                        "sepia",
                        "transparency",
                        "scale",
                        "skew X",
                        "skew Y",
                        "offset X",
                        "offset Y",
                        "rotation",
                        "border radius",
                    ],
                },
                BORDERTYPES: {
                    acceptReporters: true,
                    items: [
                        "dotted",
                        "dashed",
                        "solid",
                        "double",
                        "groove",
                        "ridge",
                        "inset",
                        "outset",
                        "none",
                    ],
                },
            },
        };
    }
    geteffect({ EFFECT }) {
        if (EFFECT === "blur") {
            return blur;
        } else if (EFFECT === "contrast") {
            return contrast;
        } else if (EFFECT === "saturation") {
            return saturation;
        } else if (EFFECT === "color shift") {
            return color;
        } else if (EFFECT === "brightness") {
            return brightness;
        } else if (EFFECT === "invert") {
            return invert;
        } else if (EFFECT === "resize rendering mode") {
            return resizeMode;
        } else if (EFFECT === "sepia") {
            return sepia;
        } else if (EFFECT === "transparency") {
            return transparency;
        } else if (EFFECT === "scale") {
            return scale;
        } else if (EFFECT === "skew X") {
            return skewX;
        } else if (EFFECT === "skew Y") {
            return skewY;
        } else if (EFFECT === "offset X") {
            return offsetX;
        } else if (EFFECT === "offset Y") {
            return offsetY;
        } else if (EFFECT === "rotation") {
            return rotation;
        } else if (EFFECT === "border radius") {
            return borderRadius;
        }
        return "";
    }
    seteffect({ EFFECT, NUMBER }) {
        NUMBER = Cast.toNumber(NUMBER);
        if (EFFECT === "blur") {
            blur = NUMBER;
        } else if (EFFECT === "contrast") {
            contrast = NUMBER;
        } else if (EFFECT === "saturation") {
            saturation = NUMBER;
        } else if (EFFECT === "color shift") {
            color = NUMBER;
        } else if (EFFECT === "brightness") {
            brightness = NUMBER;
        } else if (EFFECT === "invert") {
            invert = NUMBER;
        } else if (EFFECT === "sepia") {
            sepia = NUMBER;
        } else if (EFFECT === "transparency") {
            transparency = NUMBER;
        } else if (EFFECT === "scale") {
            scale = NUMBER;
        } else if (EFFECT === "skew X") {
            skewX = NUMBER;
        } else if (EFFECT === "skew Y") {
            skewY = NUMBER;
        } else if (EFFECT === "offset X") {
            offsetX = NUMBER;
        } else if (EFFECT === "offset Y") {
            offsetY = NUMBER;
        } else if (EFFECT === "rotation") {
            rotation = NUMBER;
        } else if (EFFECT === "border radius") {
            borderRadius = NUMBER;
        }
        updateStyle();
    }
    changeEffect(args) {
        const EFFECT = args.EFFECT;
        const currentEffect = this.geteffect(args);
        const NUMBER = Cast.toNumber(args.NUMBER) + currentEffect;
        if (EFFECT === "blur") {
            blur = NUMBER;
        } else if (EFFECT === "contrast") {
            contrast = NUMBER;
        } else if (EFFECT === "saturation") {
            saturation = NUMBER;
        } else if (EFFECT === "color shift") {
            color = NUMBER;
        } else if (EFFECT === "brightness") {
            brightness = NUMBER;
        } else if (EFFECT === "invert") {
            invert = NUMBER;
        } else if (EFFECT === "sepia") {
            sepia = NUMBER;
        } else if (EFFECT === "transparency") {
            transparency = NUMBER;
        } else if (EFFECT === "scale") {
            scale = NUMBER;
        } else if (EFFECT === "skew X") {
            skewX = NUMBER;
        } else if (EFFECT === "skew Y") {
            skewY = NUMBER;
        } else if (EFFECT === "offset X") {
            offsetX = NUMBER;
        } else if (EFFECT === "offset Y") {
            offsetY = NUMBER;
        } else if (EFFECT === "rotation") {
            rotation = NUMBER;
        } else if (EFFECT === "border radius") {
            borderRadius = NUMBER;
        }
        updateStyle();
    }
    cleareffects() {
        borderRadius = 0;
        rotation = 0;
        offsetY = 0;
        offsetX = 0;
        skewY = 0;
        skewX = 0;
        scale = 100;
        transparency = 0;
        sepia = 0;
        blur = 0;
        contrast = 100;
        saturation = 100;
        color = 0;
        brightness = 100;
        invert = 0;
        resizeMode = "default";
        imageC = ["", 100];
        borderC = [0, "none", "#ff0000", "transparent"];
        updateStyle();
    }
    setrendermode({ EFFECT }) {
        resizeMode = EFFECT;
        updateStyle();
    }
    renderscale({ X, Y }) {
        this.runtime.renderer.resize(X, Y);
    }
    setImage(args) {
        this.runtime.vm.securityManager
            .canFetch(encodeURI(args.IMAGE))
            .then((canFetch) => {
                if (canFetch) {
                    imageC = [`url(${encodeURI(args.IMAGE)})`, args.AMT];
                } else {
                    console.log("Cannot fetch content from the URL.");
                    imageC = [];
                }
                updateStyle();
            });
    }
    setBorder(args) {
        borderC = [args.THICK, args.BORDER, args.COLOR1, args.COLOR2];
        if (args.BORDER === 'none') {
            borderC[3] = 'transparent';
        }
        updateStyle();
    }
}

module.exports = CanvasEffects;
