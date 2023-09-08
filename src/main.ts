/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { BehaviorSubject, interval, merge, tap } from "rxjs";
import { scan, switchMap } from "rxjs/operators";
import { moveTetrimino, rotateTetrimino, tick, dropTetromino } from './state';
import { deleteOldTetromino, endGame, printCanvas, printPreviewTetromino, printTetromino, hide, show } from "./view";
import { Move, Rotate, Space, Drop, fromKey, updateTickRate } from "./observable";
import { State, Tick, StateChange, Block, Constants, Viewport, initialState, getRandomTetrimono, TickRateSubject } from "./types";

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  // const container = document.querySelector("#main") as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** User input */
  const space$ = fromKey("Space", new Space());
  const up$ = fromKey("KeyW", new Rotate());
  const drop$ = fromKey("KeyQ", new Drop());
  const left$ = fromKey("KeyA", new Move(-Block.WIDTH, 0));
  const right$ = fromKey("KeyD", new Move(Block.WIDTH, 0));
  const down$ = fromKey("KeyS", new Move(0, Block.HEIGHT));

  // Subject to update the tick rate
  const tickRateSubject: TickRateSubject = new BehaviorSubject(Constants.TICK_RATE_MS - 28);
  const tick$ = tickRateSubject.pipe(switchMap(rate => interval(rate))) as Tick;

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    levelText.textContent = s.level.toString();
    scoreText.textContent = s.score.toString();
    highScoreText.textContent = s.highScore.toString();

    // Add blocks to the main grid canvas
    printPreviewTetromino(preview, s.nextTetromino);
    deleteOldTetromino(s.nextTetromino.id!, "previewId");
    printTetromino(svg, s.currentTetromino);
    printCanvas(svg, s.grid);
    deleteOldTetromino(s.currentTetromino.id!, "id");
    endGame(s);
  };

  const reduceState = (s: State, stateChange: StateChange) => {
    switch (true) {
      case (stateChange instanceof Drop && !s.gameEnd):
        return dropTetromino(s);
      case (stateChange instanceof Rotate && !s.gameEnd):
        return rotateTetrimino(s);
      case (stateChange instanceof Move && !s.gameEnd):
        return moveTetrimino(s, stateChange);
      case (stateChange instanceof Space && s.gameEnd):
        return {
          ...s,
          gameEnd: false,
          score: 0,
          grid: new Array(20).fill(0).map(() => new Array(10).fill({ value: 0 })),
          currentTetromino: getRandomTetrimono(1),
          nextTetromino: getRandomTetrimono(2),
          level: 0,
        };
      case (s.gameEnd):
        return s;
      default:
        return tick(s);
    }
  }

  merge(tick$, down$, up$, left$, right$, space$, drop$)
    .pipe(scan(reduceState, initialState),
      tap(state => {
        if (tick$?.source?.value !== state.tickRate) {
          updateTickRate(tickRateSubject, state.tickRate);
        }
      }))
    .subscribe((s: State) => {
      render(s);

      s.gameEnd ? show(gameover) : hide(gameover);
    });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
