const Cast = require('../../util/cast');
const Clone = require('../../util/clone');

class Seperator {
    static _createArrayOfLength(length, item) {
        length = Cast.toNumber(length);
        if (length <= 0) return [];
        if (!isFinite(length)) return [];
        const newArray = Array.from(Array(length).keys()).map(() => {
            return item;
        });
        return Clone.simple(newArray);
    }
    static _validateUnsignedInteger(int) {
        int = Cast.toNumber(int);
        if (int < 0) int = 0;
        if (!isFinite(int)) int = 0;
        return Math.round(int);
    }
    static _splitNumber(num) {
        const number = Math.round(Cast.toNumber(num));
        if (number === 0) return [0, 0];
        if (!isFinite(number)) return [0, 0];
        return [
            Math.ceil(number / 2),
            Math.floor(number / 2)
        ];
    }
    /**
     * Adds extra space in a grid so large pathers can still get around objects.
     * @param {Grid} grid The grid that needs extra spacing
     * @param {number} amount Amount of extra tiles you want to add on each side
     * @returns The new grid with it's margins
     */
    static marginGrid(grid, amount) {
        // amount must be round & not inf or less than 0
        amount = Seperator._validateUnsignedInteger(amount);

        const newGrid = Clone.simple(grid);
        // console.log(Clone.simple(newGrid), newGrid[0].length);
        const gridLength = Seperator._validateUnsignedInteger(newGrid[0] ? newGrid[0].length : 0);
        const fillerRow = Seperator._createArrayOfLength(gridLength, 0);
        // add 0s to the top and bottom
        for (let i = 0; i < amount; i++) {
            // we need to push new copies
            // otherwise we store the same array
            // but in multiple indexes
            const first = Clone.simple(fillerRow);
            const last = Clone.simple(fillerRow);
            newGrid.unshift(first);
            newGrid.push(last);
        }
        // console.log(Clone.simple(newGrid), amount);
        // add 0s to the individual rows to expand the sides
        for (const row of newGrid) {
            for (let i = 0; i < amount; i++) {
                row.unshift(0);
                row.push(0);
            }
        }
        return newGrid;
    }
    /**
     * Thickens the walls in the grid. Unlike marginGrid, this actually cuts the numbers in half properly.
     * Odd numbers are split, see below which sides get the larger split.
     * @param {Grid} grid The grid that needs thicker walls
     * @param {number} width The width that will be thickened. Odd numbers will thicken the right, then the left.
     * @param {number} height The height that will be thickened. Odd numbers will thicken the top, then the bottom.
     * @returns The new grid with the padded walls.
     */
    static padGrid(grid, width, height) {
        // split the width & height numbers so we can thicken the walls with them
        // we need to subtract 1 without going negative so that wall thickness is reasonable
        const reasonableW = Math.max(0, Cast.toNumber(width) - 1);
        const reasonableH = Math.max(0, Cast.toNumber(height) - 1);
        const splitW = Seperator._splitNumber(reasonableW);
        const splitH = Seperator._splitNumber(reasonableH);
        // we need the original grid so we dont thicken walls after we already thickened them
        const originalGrid = Clone.simple(grid);
        const newGrid = Clone.simple(grid);
        // go through each row & tile of the grid
        const idx = {
            row: 0,
            tile: 0
        }
        for (const row of newGrid) {
            for (const _ of row) {
                // if not a wall, increment index & continue to next iteration
                if (originalGrid[idx.row][idx.tile] <= 0) {
                    idx.tile++;
                    continue;
                }
                // console.log('can');
                // we are a wall, thicken
                // thicken horizontally first as its the easiest
                for (let i = 0; i < splitW[0]; i++) {
                    // right
                    const nextTile = idx.tile + (i + 1);
                    // dont continue if there is no next tile
                    // this can happen if we reach the boundary
                    // of the grid
                    if (typeof row[nextTile] !== 'number') continue;
                    // set next tile to a wall
                    row[nextTile] = 1;
                }
                for (let i = 0; i < splitW[1]; i++) {
                    // left
                    const nextTile = idx.tile - (i + 1);
                    // dont continue if there is no next tile
                    // this can happen if we reach the boundary
                    // of the grid
                    if (typeof row[nextTile] !== 'number') continue;
                    // set next tile to a wall
                    row[nextTile] = 1;
                }
                // thicken vertically
                for (let i = 0; i < splitH[0]; i++) {
                    // top
                    const nextRow = idx.row - (i + 1);
                    // dont continue if there is no next row
                    // this can happen if we reach the boundary
                    // of the grid
                    if (!originalGrid[nextRow]) continue;
                    // get next row
                    const foundRow = newGrid[nextRow];
                    // set tile to a wall
                    foundRow[idx.tile] = 1;
                }
                for (let i = 0; i < splitH[1]; i++) {
                    // bottom
                    const nextRow = idx.row + (i + 1);
                    // dont continue if there is no next row
                    // this can happen if we reach the boundary
                    // of the grid
                    if (!originalGrid[nextRow]) continue;
                    // get next row
                    const foundRow = newGrid[nextRow];
                    // set tile to a wall
                    foundRow[idx.tile] = 1;
                }
                // if width & height are greater than 0, thicken diagonally
                // this is the hardest one to do because we need to modify
                // horizontal values in the vertical arrays
                // we stack a for loop in a for loop in a for loop in a for loop
                for (let i = 0; i < 2; i++) {
                    const isBottom = i === 1;
                    for (let j = 0; j < splitH[isBottom ? 1 : 0]; j++) {
                        // vertical
                        let nextRow = idx.row - (j + 1);
                        if (isBottom) nextRow = idx.row + (j + 1);
                        // dont continue if there is no next row
                        // this can happen if we reach the boundary
                        // of the grid
                        if (!originalGrid[nextRow]) continue;
                        // get next row
                        const foundRow = newGrid[nextRow];
                        for (let k = 0; k < 2; k++) {
                            const isLeft = k === 1;
                            for (let l = 0; l < splitW[isLeft ? 1 : 0]; l++) {
                                // horizontal
                                let nextTile = idx.tile + (l + 1);
                                if (isLeft) nextTile = idx.tile - (l + 1);
                                // dont continue if there is no next tile
                                // this can happen if we reach the boundary
                                // of the grid
                                if (typeof foundRow[nextTile] !== 'number') continue;
                                // set next tile to a wall
                                foundRow[nextTile] = 1;
                            }
                        }
                    }
                }
                // increment index
                idx.tile++;
            }
            // increment index and reset tile idx
            idx.row++;
            idx.tile = 0;
        }
        return newGrid;
    }
}

module.exports = Seperator;