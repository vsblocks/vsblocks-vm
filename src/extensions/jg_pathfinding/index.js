const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const formatMessage = require('format-message');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Pathfinding = require('pathfinding');
const Nodes = require('./nodes');
const Seperator = require('./seperator');
const Map = require('./map');

/*
    develope test
        do the Seperator functions work?

const _testGrid = [
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
];
console.log(_testGrid);
const _marginGrid = Seperator.marginGrid(_testGrid, 4);
console.log(_marginGrid);
const _padGrid = Seperator.padGrid(_marginGrid, 3, 3);
console.log(_padGrid);

    develope test RESULTS
        no not really for some reason
        one of the functions adds like 60 items to a row
        but only the rows that were created inside of that function

        ok now they work lol
*/

/*
    develope test
        do the Map functions work?
        
const _testMap = new Map();
console.log(Clone.simple(_testMap));
_testMap.add(0, 0, 50, 50);
_testMap.add(-50, 0, 0, -50);
console.log(Clone.simple(_testMap));
console.log(_testMap.toGrid());

    develope test RESULTS
        i put the offset x and y in the wrong order lol
        somehow Math.abs stopped working
        nvm i just messed somethin up with the offsets and X was negative
        ok somehow its sitll not working even though grid is the right size
        seems like after creating blank tiles, the walls create too many tiles
        oh i was literally just using 2 variables i shouldnt have been using
        and now grid is blank brh

        nevermind i was reading the wrong grid
        Map class should fully work
*/

/**
 * Class for Pathfinding blocks
 * @constructor
 */
class JgPathfindingBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        /**
         * The current map and it's boxes.
         */
        this.map = new Map();
        /**
         * The current settings for the pathfinding character.
         */
        this.pather = {
            x: 0,
            y: 0,
            width: 1,
            height: 1
        }
        /**
         * The current result of the pathfinding operation.
         */
        this.pathNodes = new Nodes();
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'jgPathfinding',
            name: 'Pathfinding',
            color1: '#5386E2',
            color2: '#4169B1',
            blocks: [
                {
                    opcode: 'createBlockadeAt',
                    text: formatMessage({
                        id: 'jgPathfinding.blocks.createBlockadeAt',
                        default: 'create blockade at x1: [X1] y1: [Y1] x2: [X2] y2: [Y2]',
                        description: "Block that creates a blockade in the pathfinding area."
                    }),
                    arguments: {
                        X1: { type: ArgumentType.NUMBER, defaultValue: -70 },
                        Y1: { type: ArgumentType.NUMBER, defaultValue: 20 },
                        X2: { type: ArgumentType.NUMBER, defaultValue: 70 },
                        Y2: { type: ArgumentType.NUMBER, defaultValue: -20 },
                    },
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'clearBlockades',
                    text: formatMessage({
                        id: 'jgPathfinding.blocks.clearBlockades',
                        default: 'clear blockades',
                        description: "Block that removes all blockades in the pathfinding area."
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'setPatherXY',
                    text: formatMessage({
                        id: 'jgPathfinding.blocks.setPatherXY',
                        default: 'set pather starting x: [X] y: [Y]',
                        description: "Block that sets the starting position for the pather."
                    }),
                    arguments: {
                        X: { type: ArgumentType.NUMBER, defaultValue: 0 },
                        Y: { type: ArgumentType.NUMBER, defaultValue: 120 },
                    },
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'setWidthHeight',
                    text: formatMessage({
                        id: 'jgPathfinding.blocks.setWidthHeight',
                        default: 'set pather width: [WIDTH] height: [HEIGHT]',
                        description: "Block that sets the width and height of the path follower. This allows sprites to avoid clipping inside walls on the way to the destination."
                    }),
                    arguments: {
                        WIDTH: { type: ArgumentType.NUMBER, defaultValue: 55 },
                        HEIGHT: { type: ArgumentType.NUMBER, defaultValue: 95 },
                    },
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'pathToSpot',
                    text: formatMessage({
                        id: 'jgPathfinding.blocks.pathToSpot',
                        default: 'find path to x: [X] y: [Y] around blockades',
                        description: "Block that finds a path around blockades in the pathfinding area to get to a location."
                    }),
                    arguments: {
                        X: { type: ArgumentType.NUMBER, defaultValue: 60 },
                        Y: { type: ArgumentType.NUMBER, defaultValue: -60 },
                    },
                    blockType: BlockType.COMMAND
                },
                '---',
                {
                    opcode: 'setListToPath',
                    text: formatMessage({
                        id: 'jgPathfinding.blocks.setListToPath',
                        default: 'set [LIST] to current path',
                        description: "Block that sets a list to the current path."
                    }),
                    arguments: {
                        LIST: { type: ArgumentType.LIST },
                    },
                    hideFromPalette: true,
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'getPathAs',
                    text: formatMessage({
                        id: 'jgPathfinding.blocks.getPathAs',
                        default: 'current path as [TYPE]',
                        description: "Block that returns the current path in a certain way."
                    }),
                    arguments: {
                        TYPE: { type: ArgumentType.STRING, menu: "pathReturnType" },
                    },
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
            ],
            menus: {
                // lists: "menuLists",
                pathReturnType: {
                    acceptReporters: true,
                    items: [
                        "json arrays",
                        "json array with objects",
                        "json object",
                        "comma seperated list",
                    ].map(item => ({ text: item, value: item }))
                }
            }
        };
    }
    // menus

    // blocks
    createBlockadeAt(args) {
        const x1 = Cast.toNumber(args.X1);
        const y1 = Cast.toNumber(args.Y1);
        const x2 = Cast.toNumber(args.X2);
        const y2 = Cast.toNumber(args.Y2);
        // add to map
        this.map.add(x1, y1, x2, y2);
    }
    clearBlockades() {
        this.map.clear();
    }

    setPatherXY(args) {
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        this.pather.x = x;
        this.pather.y = y;
    }
    setWidthHeight(args) {
        const width = Cast.toNumber(args.WIDTH);
        const height = Cast.toNumber(args.HEIGHT);
        this.pather.width = width;
        this.pather.height = height;
    }

    pathToSpot(args) {
        const goalX = Cast.toNumber(args.X);
        const goalY = Cast.toNumber(args.Y);
        const exported = this.map.toGrid();
        // add margins
        const stageSize = {
            width: this.runtime.stageWidth,
            height: this.runtime.stageHeight
        };
        const marginSize = (stageSize.height > stageSize.width ? stageSize.height : stageSize.width)
            + (this.pather.height > this.pather.width ? this.pather.height : this.pather.width)
            + 24;
        // use the margins & add padding to the walls for the final matrix
        const marginMatrix = Seperator.marginGrid(exported.grid, marginSize);
        const matrix = Seperator.padGrid(marginMatrix, this.pather.width, this.pather.height);
        // get proper offsets
        const offset = exported.offset;
        offset.left -= marginSize;
        offset.top += marginSize;
        // setup pathfinding
        const grid = new Pathfinding.Grid(matrix);
        const finder = new Pathfinding.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true
        });
        // set real starts and goals
        // this is based on the offset
        const realPositions = Clone.simple({
            start: {
                x: this.pather.x - offset.left,
                y: Math.abs(this.pather.y - offset.top),
            },
            end: {
                x: goalX - offset.left,
                y: Math.abs(goalY - offset.top),
            }
        });
        const path = Pathfinding.Util.compressPath(finder.findPath(
            realPositions.start.x,
            realPositions.start.y,
            realPositions.end.x,
            realPositions.end.y,
            grid
        ));
        // we need to do more offsetting for the resulting path
        // also need to convert it to nodes
        const newPath = new Nodes();
        for (const node of path) {
            const x = node[0] + offset.left;
            const y = 0 - (node[1] - offset.top);
            newPath.push([x, y]);
        }
        this.pathNodes = newPath;
    }

    setListToPath(args, util) {
        console.log(args);
        const list = util.target.lookupOrCreateList(args.LIST.id, args.LIST.name);
        list.value = push(args.ITEM);
    }
    getPathAs(args) {
        const switchh = Cast.toString(args.TYPE).toLowerCase();
        switch (switchh) {
            case 'json array with objects':
                return JSON.stringify(this.pathNodes.getObjects());
            case 'json object':
                return JSON.stringify(this.pathNodes.getAsObject());
            case 'comma seperated list':
                return this.pathNodes.getCommaSeperated();
            default:
                return JSON.stringify(this.pathNodes.getRaw());
        }
    }
}

module.exports = JgPathfindingBlocks;
