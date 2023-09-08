import { describe, expect, it } from "vitest";
import {
    clearedGridAndPoints,
    handleGameEnd,
    moveAction,
    tick,
    updateLevelAndTickRate
} from '../src/state'; // Adjust this to the actual module name
import { Block, Color, Constants, Tetromino, getRandomTetrimono, initialState } from '../src/types';

const color: Color = "red";
const type: Tetromino = "cube";

describe('Tetrimino Actions', () => {
    it('moveAction should change Tetrimino position', () => {
        const state = {
            ...initialState,
            currentTetromino: { x: 10, y: 10, id: 1, type, shape: [[1, 1], [1, 1]], color },
        };
        const stateChange = { x: 5, y: 5 };
        const result = moveAction(state, stateChange);
        expect(result.x).toBe(15);
        expect(result.y).toBe(15);
    });
});

describe('Tick', () => {
    it('tick should move Tetrimino down', () => {
        const state = {
            ...initialState,
        };
        const result = tick(state);
        expect(result.currentTetromino.y).toBe(Block.HEIGHT);
    });

    it('handleGameEnd should mark game as ended', () => {
        const state = {
            ...initialState,
            currentTetromino: getRandomTetrimono(1),
            grid: new Array(20).fill(0).map(() => new Array(10).fill({ value: 1 }))
        };
        const result = handleGameEnd(state);
        expect(result.gameEnd).toBe(true);
    });
});

describe('End Game', () => {
    it('handleGameEnd should mark game as ended', () => {
        const state = {
            ...initialState,
            currentTetromino: getRandomTetrimono(1),
            grid: new Array(20).fill(0).map(() => new Array(10).fill({ value: 1 }))
        };
        const result = handleGameEnd(state);
        expect(result.gameEnd).toBe(true);
    });
});


describe('Clear Grid and Points', () => {
    it('should not clear any row if no row is filled', () => {
        const result = clearedGridAndPoints(initialState.grid);
        expect(result.grid.length).toBe(20);
        expect(result.points).toBe(0);
    });
});


describe('updateLevelAndTickRate', () => {
    it('should update level and tick rate based on score and new points', () => {
        let result = updateLevelAndTickRate(0, 4);
        expect(result.level).toBe(1);
        expect(result.tickRate).toBe(Constants.TICK_RATE_MS - 30);

        result = updateLevelAndTickRate(10, 5);
        expect(result.level).toBe(4);
        expect(result.tickRate).toBe(Constants.TICK_RATE_MS - (30 * 4));
    });

    it('should cap the level at 15', () => {
        const result = updateLevelAndTickRate(100, 5);
        expect(result.level).toBe(15);
        expect(result.tickRate).toBe(Constants.TICK_RATE_MS - (30 * 15));
    });
});
