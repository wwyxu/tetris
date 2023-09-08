import { Block, Color, Grid, GridObject, TetrominoShape, Viewport } from "./types";

/**
 * Type guard for use in filters
 * @param input something that might be null or undefined
 */
export function isNotNullOrUndefined<T extends object>(input: null | undefined | T): input is T {
    return input != null;
}

/**
 * Composable not: invert boolean result of given function
 * @param f a function returning boolean
 * @param x the value that will be tested with f
 */
export const not = <T>(f: (x: T) => boolean) => (x: T) => !f(x);

/**
 * Rotates a 2d array
 * @param shape Shape of the tetromino
 * @returns Boolean wether valid or not
 */
export function rotateShapeClockwise<T>(shape: readonly T[][]): readonly T[][] {
    return Array(shape[0].length).fill(null).map((_, col) =>
        shape.slice().reverse().map(row => row[col])
    );
}

/**
 * Checked if a block is off screen
 * @param x x location of block
 * @param y y location of block
 * @param width width of block
 * @param height height of block
 * @returns Boolean is off screen or not
 */
export const isOffScreen = (x: number, y: number, width: number, height: number): boolean => x < 0 || x + width > Viewport.CANVAS_WIDTH || y + height > Viewport.CANVAS_HEIGHT;

/**
 * gets the grid coordinate from x/y and width/width
 * @param coord number 
 * @param blockSize width/height of blocm
 * @returns Grid location
 */
export const toGridCoordinates = (coord: number, blockSize: number): number => coord / blockSize;

/**
 * checks if shapes and grid coincide
 * @param coord number 
 * @param blockSize width/height of blocm
 * @returns Grid location
 */
export const shapeAndGridCoincide = (shape: TetrominoShape, grid: Grid, x: number, y: number): boolean => {
    return shape.reduce((acc, row, rowIndex) => {
        return acc || row.some((cell, cellIndex) => cell === 1 && grid[y + rowIndex][x + cellIndex].value === 1);
    }, false);
};

/**
 * Determines wether a tetrimino can be inserted in a grid position, used throughout the game for rotation/movement/drop etc
 * @param x x coordinate of the tetrimino
 * @param y y coordinate of the tetrimino
 * @param shape shape of the trimino
 * @grid current state of the grid
 * @returns Boolean wether valid or not
 */
export function isValidPosition(x: number, y: number, shape: TetrominoShape, grid: Grid): boolean {
    if (not(isNotNullOrUndefined)(shape) || not(isNotNullOrUndefined)(shape[0])) return false;

    return !isOffScreen(x, y, shape[0].length * Block.WIDTH, shape.length * Block.HEIGHT) &&
        !shapeAndGridCoincide(shape, grid, toGridCoordinates(x, Block.WIDTH), toGridCoordinates(y, Block.HEIGHT));
}

/**
 * Higher Order Function to traverse 2d arr.
 *
 * @param rows number of rows
 * @param cols number of cols
 * @param callback - Function to be executed on each cell in the grid.
 */
export function traverseMatrix(rows: number, cols: number, callback: (row: number, col: number) => void) {
    return Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
            callback(row, col);
            return null;
        })
    );
}

/**
 * Checks if the entire row on the grid is filled with blocks.
 *
 * @param row A row from the game grid.
 * @returns Returns true if the row is completely filled, otherwise false.
 */
export const isRowFilled = (row: GridObject[]) => row.every((cell: GridObject) => cell.value !== 0);

/**
 * Adds a tetromino to grid
 *
 * @param grid 2D array
 * @param x x location of tetromino
 * @param y y location of tetromino
 * @param shape tetromino shape
 * @param color tetromino color
 * @param grid return new grid
 */
export const addTetrominoToGrid = (grid: Grid, x: number, y: number, shape: TetrominoShape, color: Color): Grid => {
    return grid.map((row: GridObject[], rowIndex: number) => {
        if (rowIndex >= y && rowIndex < y + shape.length) {
            return row.map((cell: GridObject, colIndex: number) => {
                return colIndex >= x && colIndex < x + shape[rowIndex - y].length && shape[rowIndex - y][colIndex - x] === 1 ? { color, value: 1 } : cell;
            });
        } else {
            return row;
        }
    });
}

/**
 * Finds the drop position, which is the last valid position 
 * before reaching an invalid position from up to down, 400 as is grid height
 *
 * @param grid - The grid (or playfield) being checked.
 * @param x - The x-coordinate for the Tetromino position.
 * @param y - The y-coordinate for the Tetromino position.
 * @param shape - The shape of the Tetromino.
 * @returns The y-coordinate representing the lowest valid position for the Tetromino shape.
 */
export const findDropPosition = (grid: Grid, x: number, y: number, shape: TetrominoShape): number => {
    const increments = Array((400 - y) / Block.HEIGHT).fill(Block.HEIGHT);

    const returnY = increments.reduce((accY, height) => {
        const nextY = accY + height;
        return isValidPosition(x, nextY, shape, grid) ? nextY : accY;
    }, y);

    return returnY / Block.HEIGHT;
};
