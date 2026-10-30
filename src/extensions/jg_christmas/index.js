const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const Cast = require('../../util/cast');
const uid = require('../../util/uid');

const Textures = {
    Snow: require('./snow.png'),
    Light: require('./light.png'),
    Present: require('./present.png'),
};

/**
 * Class for Extension blocks
 * @constructor
 */
class Extension {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * @type {HTMLDivElement}
         */
        this.mainContainer = null;
        /**
         * @type {HTMLCanvasElement}
         */
        this.mainCanvas = null;
        /**
         * canvas context
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = null;

        this.initialize();

        this.snowParticles = {};
        this.lights = {};
        this.runtime.on('RUNTIME_STEP_START', () => {
            const viewBox = this.mainContainer.getBoundingClientRect();
            for (const particleId in this.snowParticles) {
                const particle = this.snowParticles[particleId];
                const element = particle.element;
                element.style.left = `calc(${particle.origin}% + ${particle.x}px)`;
                particle.x -= 3;
                const y = Cast.toNumber(element.style.top.replace('px', '')) + particle.speed;
                element.style.top = `${y}px`;
                if (element.getBoundingClientRect().right < 0 || y > viewBox.height) {
                    element.remove();
                    delete this.snowParticles[particleId];
                }
            }
            this.drawLightBackground();
        });
        this.runtime.on('PROJECT_STOP_ALL', () => {
            this.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
            this.clearSnow();
            this.removeLights();
        });
    }

    initialize() {
        const mainContainer = document.body.appendChild(document.createElement("div"));
        mainContainer.style = 'position: absolute;'
            + 'left: 0; top: 0; width: 100%; height: 100%;'
            + 'pointer-events: none; overflow: hidden;'
            + 'z-index: 1000009;';
        this.mainContainer = mainContainer;
        const mainCanvas = mainContainer.appendChild(document.createElement("canvas"));
        mainCanvas.style = 'position: absolute;'
            + 'left: 0; top: 0; width: 100%; height: 100%;'
            + 'pointer-events: none; background: none;'
            + 'border: 0; margin: 0; padding: 0;'
            + 'z-index: 999999;';
        this.mainCanvas = mainCanvas;
        mainCanvas.width = 1280;
        mainCanvas.height = 720;
        const canvasContext = mainCanvas.getContext('2d');
        this.ctx = canvasContext;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'jgChristmas',
            name: 'Christmas',
            color1: '#ff0000',
            color2: '#00ff00',
            blockIconURI: require('./icon.png'),
            blocks: [
                {
                    opcode: 'snow',
                    text: 'snow',
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'clearSnow',
                    text: 'clear snow',
                    blockType: BlockType.COMMAND
                },
                // {
                //     opcode: 'addPresent',
                //     text: 'add present',
                //     blockType: BlockType.COMMAND
                // },
                // {
                //     opcode: 'removePresents',
                //     text: 'remove all presents',
                //     blockType: BlockType.COMMAND
                // },
                {
                    opcode: 'addLight',
                    text: 'add light',
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'removeLights',
                    text: 'remove all lights',
                    blockType: BlockType.COMMAND
                },
            ]
        };
    }

    snow() {
        const snowImage = this.mainContainer.appendChild(document.createElement("img"));
        const size = Math.round(8 + (Math.random() * 16));
        const opacity = 0.5 + (Math.random() / 2);
        const originX = Math.random() * 150;
        snowImage.style = 'position: absolute;'
            + `left: ${originX}%; top: -${size}px; width: ${size}px; height: ${size}px;`
            + `pointer-events: none; opacity: ${opacity};`
            + 'z-index: 1000008;';
        snowImage.src = Textures.Snow;
        const id = uid();
        this.snowParticles[id] = {
            element: snowImage,
            origin: originX,
            x: 0,
            size: size,
            speed: 2 + Math.random() * 6
        };
    }
    removeLights() {
        this.ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        for (const particleId in this.lights) {
            const particle = this.lights[particleId];
            const element = particle.element;
            element.remove();
            delete this.lights[particleId];
        }
    }
    addLight() {
        const lightImage = this.mainContainer.appendChild(document.createElement("img"));
        const viewBox = this.mainContainer.getBoundingClientRect();
        const originX = Math.random() * viewBox.width;
        const originY = Math.random() * viewBox.height;
        const direction = Math.random() * 360;
        lightImage.style = 'position: absolute;'
            + `left: 0; top: 0; width: 70px; height: 70px;`
            + `transform: translate(${originX}px, ${originY}px) rotate(${direction}deg);`
            + `transform-origin: 34px 41px; pointer-events: none;`
            + 'z-index: 1000005;';
        lightImage.src = Textures.Light;
        const id = uid();
        this.lights[id] = {
            element: lightImage,
            x: originX,
            y: originY
        };
        this.drawLightBackground();
        let filterGreen = false;
        setInterval(() => {
            lightImage.style.filter = filterGreen ? 'hue-rotate(90deg) brightness(1.5)' : '';
            filterGreen = !filterGreen;
        }, 700);
    }
    drawLightBackground() {
        const canvas = this.mainCanvas;
        const viewBox = canvas.getBoundingClientRect();
        const ctx = this.ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#3D5C3A';
        ctx.lineWidth = 1;

        ctx.moveTo(0, 70);
        ctx.beginPath();
        for (const particleId in this.lights) {
            const particle = this.lights[particleId];
            ctx.lineTo(((particle.x + 34) / viewBox.width) * 1280, ((particle.y + 41) / viewBox.height) * 720);
            ctx.moveTo(((particle.x + 34) / viewBox.width) * 1280, ((particle.y + 41) / viewBox.height) * 720);
            ctx.stroke();
        }
    }

    clearSnow() {
        for (const particleId in this.snowParticles) {
            const particle = this.snowParticles[particleId];
            const element = particle.element;
            element.remove();
            delete this.snowParticles[particleId];
        }
    }
    addPresent() {

    }
}

module.exports = Extension;
