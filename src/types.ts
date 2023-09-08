import { BehaviorSubject, Observable } from "rxjs";
import { Move, Rotate, Space } from "./observable";

/**
 * Class for hashing
 */
export abstract class RNG {
  // LCG using GCC's constants
  private static m = 0x80000000; // 2**31
  private static a = 1103515245;
  private static c = 12345;

  /**
   * Call `hash` repeatedly to generate the sequence of hashes.
   * @param seed
   * @returns a hash of the seed
   */
  public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

  /**
   * Modulus function to map the hash value to a number between 0 and 7.
   * @param hash 
   * @returns value between 0 and 7
   */
  public static modulus = (hash: number) => hash % 8;
}

/**
 * Generates a random Tetromino object based on a given ID.
 * 
 * @param id - An identifier used to seed the RNG and ensure deterministic results.
 * @returns A random Tetromino object corresponding to the seeded RNG's output.
 */
export const getRandomTetrimono = (id: number): TetrominoObject => {
  const seed = 12345 + id;
  const hashValue = RNG.hash(seed);
  const numberBetween0And7 = RNG.modulus(hashValue);
  const tetromino: TetrominoObject = tetrominoShapes[tetrominoMapping[numberBetween0And7]];

  return { ...tetromino, id };
};

export const Bomb: Bomb = "Bomb";

export const Viewport = {
    CANVAS_WIDTH: 200,
    CANVAS_HEIGHT: 400,
    PREVIEW_WIDTH: 160,
    PREVIEW_HEIGHT: 80,
} as const;

export const Constants = {
    TICK_RATE_MS: 500,
    GRID_WIDTH: 10,
    GRID_HEIGHT: 20,
} as const

export const Block = {
    WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
    HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
} as const;

const baseTetromino = { id: 0, y: 0 };

export const tetrominoShapes: { [key: string]: TetrominoObject } = {
    cube: { ...baseTetromino, type: "cube", shape: [[1, 1], [1, 1]], color: "blue", x: Block.WIDTH * 4 },
    line: { ...baseTetromino, type: "line", shape: [[1, 1, 1, 1]], color: "cyan", x: Block.WIDTH * 3 },
    tee: { ...baseTetromino, type: "tee", shape: [[0, 1, 0], [1, 1, 1]], color: "purple", x: Block.WIDTH * 4 },
    lShape: { ...baseTetromino, type: "lShape", shape: [[1, 0], [1, 0], [1, 1]], color: "orange", x: Block.WIDTH * 4 },
    reverseLShape: { ...baseTetromino, type: "reverseLShape", shape: [[0, 1], [0, 1], [1, 1]], color: "red", x: Block.WIDTH * 4 },
    zShape: { ...baseTetromino, type: "zShape", shape: [[1, 1, 0], [0, 1, 1]], color: "yellow", x: Block.WIDTH * 4 },
    reverseZShape: { ...baseTetromino, type: "reverseZShape", shape: [[0, 1, 1], [1, 1, 0]], color: "green", x: Block.WIDTH * 4 },
    Bomb: { ...baseTetromino, type: Bomb, shape: [[1]], color: "black", x: Block.WIDTH * 5 },
    null: { ...baseTetromino, type: "cube", shape: [], color: "black", x: Block.WIDTH * 5}
};

export const tetrominoMapping: { [key: number]: Tetromino } = {
    0: "cube",
    1: "line",
    2: "tee",
    3: "lShape",
    4: "reverseLShape",
    5: "zShape",
    6: "reverseZShape",
    7: Bomb
} as const;

export const initialState: State = {
    gameEnd: false,
    currentTetromino: getRandomTetrimono(1),
    nextTetromino: getRandomTetrimono(2),
    grid: new Array(20).fill(0).map(() => new Array(10).fill({ value: 0 })),
    score: 0,
    level: 1,
    highScore: 0,
    tickRate: Constants.TICK_RATE_MS
} as const;

export type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "Space" | "KeyQ";

export type Color = "blue" | "cyan" | "purple" | "orange" | "red" | "yellow" | "green" | "black";

export type GridObject = Readonly<{
  color: Color;
  value?: number;
}>;

export type Grid = Readonly<GridObject[][]>;

export type Tick = Observable<number> & {
  source?: BehaviorSubject<number>;
};
export type TickRateSubject = BehaviorSubject<number>;
// importing oberservable type to utils/state (to use "as StateChange") will throw an error in tests, 
// so will add any here to circumvent that issue
export type StateChange = Rotate | Move | Space | unknown | any;

export type State = Readonly<{
  gameEnd: boolean;
  currentTetromino: TetrominoObject;
  nextTetromino: TetrominoObject;
  grid: Grid;
  score: number;
  level: number;
  highScore: number;
  tickRate: number;
}>;

type Bomb = "Bomb"
export type Tetromino = "cube" | "line" | "tee" | "lShape" | "reverseShape" | "zShape" | "reverseZShape" | "reverseLShape" | Bomb;

export type TetrominoShape = Readonly<Array<Array<Number>>>;

export type TetrominoObject = Readonly<{
  id: number | null;
  shape: TetrominoShape;
  color: Color;
  x: number;
  y: number;
  type: Tetromino;
}>;
