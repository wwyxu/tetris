import { BehaviorSubject, fromEvent } from "rxjs";
import { filter, map } from "rxjs/operators";
import { Key, StateChange } from "./types";

export class Space { constructor() { } }
export class Rotate { constructor() { } }
export class Drop { constructor() { } }
export class Move { constructor(public readonly x: number, public readonly y: number) { } }

// Creating an observable from keyboard press events on the document.
const key$ = fromEvent<KeyboardEvent>(document, "keypress");

/**
 * Creates an observable that emits only when a specified key is pressed.
 * 
 * @param keyCode - The key code of the key to observe. (e.g., "KeyA" for the "A" key).
 * @param stateChange - The value or state to emit when the specified key is pressed.
 * @returns An observable that emits the given `stateChange` value whenever the specified `keyCode` is pressed.
 */
export const fromKey = (keyCode: Key, stateChange: StateChange) =>
    key$.pipe(filter(({ code }) => code === keyCode),
        map(() => stateChange));

/**
 * Updates the current tick rate value by emitting a new value to the BehaviorSubject.
 *
 * @param tickRateSubject - A BehaviorSubject that holds and broadcasts the current tick rate value to its subscribers.
 * @param newTickRate - The new tick rate value to be emitted.
 */
export const updateTickRate = (tickRateSubject: BehaviorSubject<number>, newTickRate: number) => {
    tickRateSubject.next(newTickRate);
}
