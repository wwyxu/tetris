import { describe, expect, it } from "vitest";
import { rotateShapeClockwise, isOffScreen, toGridCoordinates, shapeAndGridCoincide, isValidPosition, traverseMatrix, addTetrominoToGrid, findDropPosition, isNotNullOrUndefined, isRowFilled } from '../src/utils';
import { Grid, GridObject, TetrominoShape, Viewport } from "../src/types";
import { initialState } from "../src/types";

describe('rotateShapeClockwise', () => {
  it('should correctly rotate a 2D array clockwise', () => {
    const initialShape = [
      [1, 2],
      [3, 4],
    ];
    const expectedRotatedShape = [
      [3, 1],
      [4, 2],
    ];

    expect(rotateShapeClockwise(initialShape)).toEqual(expectedRotatedShape);
  });

  it('should handle non-square matrices', () => {
    const initialShape = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const expectedRotatedShape = [
      [4, 1],
      [5, 2],
      [6, 3],
    ];

    expect(rotateShapeClockwise(initialShape)).toEqual(expectedRotatedShape);
  });
});

describe('isOffScreen', () => {
  it('should return true if block is off screen', () => {
    expect(isOffScreen(-1, 0, 100, 100)).toBe(true);
    expect(isOffScreen(0, 0, Viewport.CANVAS_WIDTH + 1, 100)).toBe(true);
    expect(isOffScreen(0, 0, 100, Viewport.CANVAS_HEIGHT + 1)).toBe(true);
  });

  it('should return false if block is on screen', () => {
    expect(isOffScreen(0, 0, Viewport.CANVAS_WIDTH, Viewport.CANVAS_HEIGHT)).toBe(false);
  });
});

describe('toGridCoordinates', () => {
  it('should convert coordinate to grid position', () => {
    expect(toGridCoordinates(20, 10)).toBe(2);
  });
});

describe('shapeAndGridCoincide', () => {
  it('should return true if shape and grid coincide', () => {
    const shape: TetrominoShape = [
      [1, 1],
      [1, 1]
    ];
    const grid: Grid = new Array(20).fill(0).map(() => new Array(10).fill({ value: 1 }))
    expect(shapeAndGridCoincide(shape, grid, 0, 0)).toBe(true);
  });
});

describe('isValidPosition', () => {
  it('should return true if position is valid', () => {
    const shape: TetrominoShape = [
      [0, 1],
      [1, 0]
    ];
    const grid: Grid = [
      [{ value: 0, color: "red" }, { value: 0, color: "red" }],
      [{ value: 0, color: "red" }, { value: 0, color: "red" }]
    ];
    expect(isValidPosition(0, 0, shape, grid)).toBe(true);
  });
});

describe('addTetrominoToGrid', () => {
  it('should add a tetromino to the grid', () => {
    const shape: TetrominoShape = [
      [0, 1],
      [1, 0]
    ];
    const grid: Grid = [
      [{ value: 0, color: 'red' }, { value: 0, color: 'red' }],
      [{ value: 0, color: 'red' }, { value: 0, color: 'red' }]
    ];
    const expectedGrid: Grid = [
      [{ value: 0, color: 'red' }, { value: 1, color: 'red' }],
      [{ value: 1, color: 'red' }, { value: 0, color: 'red' }]
    ];
    expect(addTetrominoToGrid(grid, 0, 0, shape, "red")).toEqual(expectedGrid);
  });
});

describe('findDropPosition', () => {
  it('Return the correct y coordinate for a cube', () => {
    expect(findDropPosition(initialState.grid, 0, 0, [[1, 1], [1, 1]])).toEqual(18);
  });

  it('should add a tetromino to the grid for a line', () => {
    expect(findDropPosition(initialState.grid, 0, 0, [[1, 1, 1, 1]])).toEqual(19);
  });
});

describe('Is not null or undefined', () => {
  it('Return false when inputting null', () => {
    expect(isNotNullOrUndefined(null)).toEqual(false);
  });

  it('Return true when inputting an object', () => {
    expect(isNotNullOrUndefined({})).toEqual(true);
  });
});

describe('isRowFilled function', () => {

  it('should return true if all cell values are non-zero', () => {
    const row: GridObject[] = [
      { color: 'red', value: 1 },
      { color: 'red', value: 1 },
      { color: 'red', value: 1 }
    ];
    expect(isRowFilled(row)).toBe(true);
  });

  it('should return false if any cell value is zero', () => {
    const row: GridObject[] = [
      { color: 'red', value: 0 },
      { color: 'red', value: 2 },
      { color: 'red', value: 3 }
    ];
    expect(isRowFilled(row)).toBe(false);
  });

  it('should return false if all cell values are zero', () => {
    const row: GridObject[] = [
      { color: 'red', value: 0 },
      { color: 'red', value: 0 },
      { color: 'red', value: 0 }
    ];
    expect(isRowFilled(row)).toBe(false);
  });
});
