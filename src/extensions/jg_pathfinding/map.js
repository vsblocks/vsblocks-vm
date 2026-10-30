const Cast = require('../../util/cast');
const Clone = require('../../util/clone');

const blankGridReturn = {
    grid: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ],
    offset: {
        left: 0,
        top: 0
    }
};

class Map {
    constructor() {
        this.boxes = [];
    }
    static new(...args) {
        return new Map(...args);
    }

    add(x1, y1, x2, y2) {
        // cast & round
        x1 = Math.round(Cast.toNumber(x1));
        y1 = Math.round(Cast.toNumber(y1));
        x2 = Math.round(Cast.toNumber(x2));
        y2 = Math.round(Cast.toNumber(y2));

        const position = {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
        };
        if (x2 < x1) {
            // x1 should be less
            position.x1 = x2;
            position.x2 = x1;
        }
        if (y2 > y1) {
            // y1 should be greater
            position.y1 = y2;
            position.y2 = y1;
        }
        const box = {
            x: position.x1,
            y: position.x2,
            width: position.x2 - position.x1,
            height: position.y1 - position.y2
        };
        this.boxes.push(box);
        return box;
    }
    clear() {
        this.boxes = [];
    }

    toGrid() {
        // no tiles if theres no boxes
        if (!this.boxes) return blankGridReturn;
        if (this.boxes.length <= 0) return blankGridReturn;

        const grid = [];
        // find highest y
        let highestY = -Infinity;
        for (const box of this.boxes) {
            if (box.y > highestY) highestY = box.y;
        }
        // find lowest y & its block height
        let lowestY = Infinity;
        let lowestHeight = 0;
        for (const box of this.boxes) {
            if (box.y < lowestY) {
                lowestY = box.y;
                lowestHeight = box.height;
            }
        }
        // for simplicity, we just fill this array & then clone it to make our rows
        const baseRow = [];
        // get grid width
        // find lowest x
        let lowestX = Infinity;
        for (const box of this.boxes) {
            if (box.x < lowestX) lowestX = box.x;
        }
        // find highest x & its block width
        let highestX = -Infinity;
        let highestWidth = 0;
        for (const box of this.boxes) {
            if (box.x > highestX) {
                highestX = box.x;
                highestWidth = box.width;
            }
        }
        // based on x numbers, add 0s to base row
        const xtoxwidth = (highestX - lowestX) + highestWidth;
        for (let i = 0; i < xtoxwidth; i++) {
            baseRow.push(0);
        }
        // based on y numbers, add rows to grid
        const ytoyheight = (highestY - lowestY) + lowestHeight;
        for (let i = 0; i < ytoyheight; i++) {
            // add a clone so modifiying a row doesnt modify all rows
            const clone = Clone.simple(baseRow);
            grid.push(clone);
        }

        // console.log(Clone.simple(grid));

        // fill the walls
        // we need the offset since we are converting scratch coords to grid indexes
        const offset = Clone.simple({
            top: highestY,
            left: lowestX
        });
        for (const box of this.boxes) {
            // offsetX is straight forward
            // offsetY makes everything except the highest box be a negative Y
            // so we correct for that
            const offsetX = box.x - offset.left;
            const offsetY = Math.abs(box.y - offset.top);
            let tileIdx = offsetX;
            let rowIdx = offsetY;
            // repeat (height) { repeat (width) { tileIdx++ } rowIdx++; tileIdx = offsetX; }
            // the for loops could probably be better optimized but i dont wanna focus on that until the code actually works
            for (let i = 0; i < box.height; i++) {
                for (let j = 0; j < box.width; j++) {
                    // find row & then find tile to set to 1
                    const row = grid[rowIdx];
                    row[tileIdx] = 1;
                    tileIdx++;
                }
                rowIdx++;
                tileIdx = offsetX;
            }
        }

        return {
            grid: grid,
            offset: offset
        }
    }
}

module.exports = Map;