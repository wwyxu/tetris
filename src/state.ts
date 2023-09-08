import { addTetrominoToGrid, findDropPosition, isValidPosition, rotateShapeClockwise, isNotNullOrUndefined, toGridCoordinates, not, isRowFilled } from "./utils";
import { Color, Grid, GridObject, State, StateChange, Block, Bomb, Constants, tetrominoShapes, getRandomTetrimono, TetrominoShape } from "./types";

/**
 * A higher-order function that creates a Tetrimino action based on the provided action function.
 * This function checks if the new position and shape after the action is valid. 
 * If it's valid, it updates the state with the new properties, otherwise it proceeds with the tick function.
 * 
 * @param actionFn - The action function that describes how to modify the current Tetrimino state.
 * @returns A function that applies the action and updates the Tetrimino's state.
 */
const createTetriminoAction = (actionFn: (s: State, stateChange?: StateChange) => { x: number, y: number, shape: TetrominoShape }) => {
    return (s: State, stateChange?: StateChange): State => {
        const updatedProperties = actionFn(s, stateChange);

        if (isValidPosition(updatedProperties.x, updatedProperties.y, updatedProperties.shape, s.grid)) {
            return {
                ...s,
                currentTetromino: {
                    ...s.currentTetromino,
                    ...updatedProperties
                }
            };
        } else if (not(isNotNullOrUndefined)(stateChange?.x) || stateChange.x == 0) {
            return tick(s);
        }

        return s;
    };
};

/**
 * Action that moves the Tetrimino based on the provided state change.
 * 
 * @param s - Current game state.
 * @param stateChange - The change in Tetrimino's position (x, y).
 * @returns The new properties for the Tetrimino after the move.
 */
const moveAction = (s: State, stateChange?: StateChange): { x: number, y: number, shape: TetrominoShape } => {
    return {
        x: s.currentTetromino.x + (stateChange?.x || 0),
        y: s.currentTetromino.y + (stateChange?.y || 0),
        shape: s.currentTetromino.shape
    };
};

/**
 * Action that rotates the Tetrimino clockwise.
 * 
 * @param s - Current game state.
 * @returns The new properties for the Tetrimino after the rotation.
 */
const rotateAction = (s: State): { x: number, y: number, shape: TetrominoShape } => {
    return {
        x: s.currentTetromino.x,
        y: s.currentTetromino.y,
        shape: rotateShapeClockwise(s.currentTetromino.shape)
    };
};

// Creating specific Tetrimino actions using the higher-order function.
const moveTetrimino = createTetriminoAction(moveAction);
const rotateTetrimino = createTetriminoAction(rotateAction);

/**
 * Handles tick
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => {
    // Game is over if current tetromino is invalid when added to the grid
    if (!isValidPosition(s.currentTetromino.x, s.currentTetromino.y, s.currentTetromino.shape, s.grid)) return handleGameEnd(s);
    // Handles block moving down
    if (!isValidPosition(s.currentTetromino.x, s.currentTetromino.y + Block.HEIGHT, s.currentTetromino.shape, s.grid)) return handleAddTetromino(s);

    return {
        ...s,
        currentTetromino: { ...s.currentTetromino, y: s.currentTetromino.y + Block.HEIGHT },
    };
};

/**
 * Handle game state when over
 *
 * @param s Current state
 * @returns Updated state
 */
const handleGameEnd = (s: State): State => {
    return {
        ...s,
        grid: addTetrominoToGrid(s.grid, s.currentTetromino.x / Block.WIDTH, s.currentTetromino.y / Block.HEIGHT, s.currentTetromino.shape, s.currentTetromino.color),
        currentTetromino: { ...tetrominoShapes["null"], id: s.currentTetromino.id },
        nextTetromino: { ...tetrominoShapes["null"], id: s.currentTetromino.id },
        gameEnd: true,
        highScore: s.score > s.highScore ? s.score : s.highScore
    };
}

/**
 * Bomb detonates and removed surrounding blocks
 *
 * @param grid The current state of the game grid.
 * @param x The x-coordinate where the bomb is placed.
 * @param y The y-coordinate where the bomb is placed.
 * @param color The color of the bomb.
 * @returns The updated game grid.
 */
const addBombToGrid = (grid: Grid, x: number, y: number, color: Color): Grid => {
    return grid.map((row: GridObject[], rowIndex: number) => {
        return row.map((cell: GridObject, colIndex: number) => {
            // Check if it's inside the blast radius
            if (Math.abs(rowIndex - y) <= 1 && Math.abs(colIndex - x) <= 1) {
                return { color, value: 0 };
            }

            return cell;
        });
    });
}

/**
 * Calculates the cleared grid after rows have been removed and calculates the points based on the removed rows.
 * 
 * @param grid - The current state of the game grid.
 * @returns Returns the new grid state after row clearance and the points scored.
 */
export const clearedGridAndPoints = (grid: Grid): { grid: Grid; points: number } => {
    const clearedGrid = grid.filter((row: GridObject[]) => !isRowFilled(row));
    const points = grid.length - clearedGrid.length;
    const newRows = Array(points).fill(0).map(() => new Array(10).fill({ value: 0 }));
    return { grid: [...newRows, ...clearedGrid], points };
}

/**
 * Updates the game level and tick rate based on the player's current score and newly earned points.
 * 
 * @param score The player's current score.
 * @param newPoints The points recently earned by the player.
 * @returns Returns the updated game level and the new tick rate.
 */
export const updateLevelAndTickRate = (score: number, newPoints: number): { level: number; tickRate: number } => {
    const level = Math.min(Math.floor((score + newPoints) / 5) + 1, 15);
    const tickRate = Constants.TICK_RATE_MS - (30 * level);
    return { level, tickRate };
}

/**
 * A higher-order function that computes the new game grid and updates the state.
 * It abstracts the shared logic between `dropTetromino` and `handleAddTetromino`.
 * 
 * @param getY - A function that determines the y position of the tetromino.
 * @returns - A function that takes the current state and returns the updated state.
 */
const computeGridAndUpdateState = (getY: (s: State) => number) => (s: State): State => {
    const x = s.currentTetromino.x / Block.WIDTH;
    const y = getY(s);

    const grid = s.currentTetromino.type !== Bomb
        ? addTetrominoToGrid(s.grid, x, y, s.currentTetromino.shape, s.currentTetromino.color)
        : addBombToGrid(s.grid, x, y, s.currentTetromino.color);
    const { grid: newGrid, points: newPoints } = clearedGridAndPoints(grid);

    return {
        ...s,
        currentTetromino: s.nextTetromino,
        nextTetromino: getRandomTetrimono(s.nextTetromino.id! + 1),
        grid: newGrid,
        score: s.score + newPoints,
        ...updateLevelAndTickRate(s.score, newPoints)
    };
}

/**
 * Handle game state when a tetromino is dropped.
 *
 * @param s - Current state.
 * @returns - Updated state after dropping the tetromino.
 */
const dropTetromino = computeGridAndUpdateState(s => findDropPosition(s.grid, s.currentTetromino.x, s.currentTetromino.y, s.currentTetromino.shape));

/**
 * Handle game state when a new tetromino is added to the grid. i.e can't move down anymore
 *
 * @param s - Current state.
 * @returns - Updated state after adding the tetromino to the grid.
 */
const handleAddTetromino = computeGridAndUpdateState(s => s.currentTetromino.y / Block.HEIGHT);

export { moveTetrimino, rotateTetrimino, tick, moveAction, createTetriminoAction, rotateAction, handleGameEnd, handleAddTetromino, dropTetromino };
