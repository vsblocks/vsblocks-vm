const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const Cast = require('../../util/cast');
const Timer = require('./Timer');

/**
 * Class for Timers blocks
 * @constructor
 */
class JgTimersBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this.timers = {};
        // pause/unpause timers when the project pauses
        runtime.on("RUNTIME_PAUSED", () => {
            this._getTimersArray().forEach(timer => timer.instance.pause(true));
        });
        runtime.on("RUNTIME_UNPAUSED", () => {
            this._getTimersArray().forEach(timer => timer.instance.start(true));
        });
    }

    // util

    _getTimersArray() {
        return Object.values(this.timers);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'jgTimers',
            name: 'Multiple Timers',
            color1: '#0093FE',
            color2: '#1177FC',
            blocks: [
                {
                    opcode: 'createTimer',
                    text: 'create timer named [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'deleteTimer',
                    text: 'delete timer named [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'deleteAllTimer',
                    text: 'delete all timers',
                    blockType: BlockType.COMMAND
                },

                { text: "Values", blockType: BlockType.LABEL, },

                {
                    opcode: 'getTimer',
                    text: 'get timer named [NAME]',
                    blockType: BlockType.REPORTER,
                    disableMonitor: false,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'getTimerData',
                    text: 'get [DATA] of timer named [NAME]',
                    blockType: BlockType.REPORTER,
                    disableMonitor: false,
                    arguments: {
                        DATA: { type: ArgumentType.STRING, menu: "timerData" },
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'existsTimer',
                    text: 'timer named [NAME] exists?',
                    blockType: BlockType.BOOLEAN,
                    disableMonitor: false,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },

                {
                    opcode: 'getAllTimer',
                    text: 'get all timers',
                    blockType: BlockType.REPORTER,
                    disableMonitor: false
                },

                { text: "Operations", blockType: BlockType.LABEL, },

                {
                    opcode: 'startTimer',
                    text: 'start timer [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'pauseTimer',
                    text: 'pause timer [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'stopTimer',
                    text: 'stop timer [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'resetTimer',
                    text: 'reset timer [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
                {
                    opcode: 'addTimer',
                    text: 'add [SECONDS] seconds to timer [NAME]',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SECONDS: { type: ArgumentType.NUMBER, defaultValue: 5 },
                        NAME: { type: ArgumentType.STRING, defaultValue: "timer" }
                    }
                },
            ],
            menus: {
                timerData: {
                    acceptReporters: true,
                    items: [
                        "milliseconds",
                        "minutes",
                        "hours",
                        // haha funny options
                        "days",
                        "weeks",
                        "years"
                    ].map(item => ({ text: item, value: item }))
                }
            }
        };
    }

    // blocks

    createTimer(args) {
        const timer = this.timers[args.NAME];
        if (timer) return;
        this.timers[args.NAME] = {
            name: Cast.toString(args.NAME),
            instance: new Timer()
        };
    }
    deleteTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return;
        delete this.timers[args.NAME];
    }
    deleteAllTimer() {
        this.timers = {};
    }

    getTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return "";
        const time = timer.instance.getTime(true);
        return Cast.toNumber(time);
    }
    getTimerData(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return "";
        const seconds = Cast.toNumber(timer.instance.getTime(true));
        switch (args.DATA) {
            case "milliseconds":
                return seconds * 1000;
            case "minutes":
                return Math.floor(seconds / 60);
            case "hours":
                return Math.floor(seconds / 3600);
            case "days":
                return Math.floor(seconds / 86400);
            case "weeks":
                return Math.floor(seconds / 604800);
            case "years":
                return Math.floor(seconds / 31536000);
            default:
                return seconds;
        }
    }
    existsTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return false;
        return true;
    }
    getAllTimer() {
        return JSON.stringify(this._getTimersArray().map(timer => timer.name));
    }

    startTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return;
        timer.instance.start();
    }
    pauseTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return;
        timer.instance.pause();
    }
    stopTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return;
        timer.instance.stop();
    }
    resetTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return;
        timer.instance.reset();
    }

    addTimer(args) {
        const timer = this.timers[args.NAME];
        if (!timer) return;
        const seconds = Cast.toNumber(args.SECONDS);
        timer.instance.add(seconds * 1000);
    }
}

module.exports = JgTimersBlocks;
