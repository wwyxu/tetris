import { Color, Grid, State, TetrominoObject, Block, Bomb } from "./types";
import { isNotNullOrUndefined, not, traverseMatrix } from "./utils";

/**
 * set a number of attributes on an Element at once
 * @param e the Element
 * @param o a property bag
 */
const attr = (e: Element, o: { [p: string]: unknown }) => { for (const k in o) e.setAttribute(k, String(o[k])) }

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
export const show = (elem: SVGGraphicsElement) => {
    attr(elem, { visibility: "visible" });
    elem.parentNode!.appendChild(elem);
};

/**
* Hides a SVG element on the canvas.
* @param elem SVG element to hide
*/
export const hide = (elem: SVGGraphicsElement) =>
    attr(elem, { visibility: "hidden" })

/**
* Creates an SVG element with the given properties.
*
* See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
* element names and properties.
*
* @param namespace Namespace of the SVG element
* @param name SVGElement name
* @param props Properties to set on the SVG element
* @returns SVG element
*/
export const createSvgElement = (
    namespace: string | null,
    name: string,
    props: Record<string, string> = {}
) => {
    const elem = document.createElementNS(namespace, name) as SVGElement;
    Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));

    return elem;
};

/**
 * Higher order function to create a shape
 *
 * @param shape, type of shape
 * @param rx radius x
 * @param ry radius x
 * @returns function
 */
const createObj = (shape: string) => (rx?: number, ry?: number) =>
    (parent: SVGGraphicsElement & HTMLElement, id: string, x: number, y: number, fill: Color) => {
        if (!document.getElementById(id)) {
            const obj = createSvgElement(parent.namespaceURI, shape, {
                height: `${Block.HEIGHT}`,
                width: `${Block.WIDTH}`,
                rx: `${rx ?? 0}`,
                ry: `${ry ?? 0}`,
                x: `${x}`,
                y: `${y}`,
                style: `fill: ${fill}`,
                id,
            });

            parent.appendChild(obj);
        }
    };

/**
* Function to create a cube
*/
export const createCube = createObj("rect")();

/**
* Function to create a circle
*/
export const createCircle = createObj("rect")(Block.HEIGHT / 2, Block.HEIGHT / 2);

/**
* Delete element based on id
*
* @param id Id of element,
* @returns null
*/
export const deleteElementById = (id: string): void => {
    const currTetrominoElement = document.getElementById(id)!;

    if (currTetrominoElement) {
        currTetrominoElement.remove();
    }
}

/**
 * Checks if a tetromino exists on the SVG canvas.
 *
 * @param tetromino - The tetromino object to check.
 * @returns {boolean} - Returns true if the tetromino doesn't exist, otherwise false.
 */
export function tetrominoDoesExists(tetromino: TetrominoObject) {
    return !document.getElementById(`id: ${tetromino.id}, row: 0, col: 0`) && !document.getElementById(`id: ${tetromino.id}, row: 0, col: 1`)
        && !document.getElementById(`id: ${tetromino.id}, row: 1, col: 1`) && !document.getElementById(`id: ${tetromino.id}, row: 1, col: 2`)
};


/**
 * Renders the preview of the upcoming tetromino on the SVG canvas.
 *
 * @param parent - The SVG canvas parent element.
 * @param tetromino - The tetromino object to be previewed.
 */
export function printPreviewTetromino(parent: SVGGraphicsElement &
    HTMLElement, tetromino: TetrominoObject) {
    if (!tetromino?.shape?.length) {
        return;
    }

    traverseMatrix(tetromino.shape.length, tetromino.shape[0].length, (row: number, col: number) => {
        if (tetromino.shape[row][col] == 1) {
            tetromino.type == Bomb ? createCircle(parent, `previewId: ${tetromino.id}, row: ${row}, col: ${col}`, 50 + col * Block.WIDTH, 20 + row * Block.HEIGHT, tetromino.color) : createCube(parent, `previewId: ${tetromino.id}, row: ${row}, col: ${col}`, 50 + col * Block.WIDTH, 20 + row * Block.HEIGHT, tetromino.color);
        }
    })
}

/**
 * Renders the main game grid on the SVG canvas.
 *
 * @param parent - The SVG canvas parent element.
 * @param grid - The current game grid.
 */
export function printCanvas(parent: SVGGraphicsElement &
    HTMLElement, grid: Grid) {
    traverseMatrix(20, 10, (row: number, col: number) => {
        grid[row][col].value ? createCube(parent, `row: ${row}, col: ${col}`, col * Block.WIDTH, row * Block.HEIGHT, grid[row][col].color) : deleteElementById(`row: ${row}, col: ${col}`)!
    });
}

/**
 * Removes previously displayed tetrominoes from the SVG canvas.
 *
 * @param index - The index of the tetromino.
 * @param id - The ID prefix used for the SVG elements representing the tetromino.
 */
export function deleteOldTetromino(index: number, id: string) {
    traverseMatrix(4, 4, (row: number, col: number) => {
        deleteElementById(`${id}: ${index - 1}, row: ${row}, col: ${col}`)!;
        deleteElementById(`${id}: ${index - 2}, row: ${row}, col: ${col}`)!;
    })
}

/**
 * Places a new tetromino on the SVG canvas.
 *
 * @param parent - The SVG canvas parent element.
 * @param tetromino - The tetromino object to be rendered.
 */
function printNewTetromino(parent: SVGGraphicsElement &
    HTMLElement, tetromino: TetrominoObject) {
    traverseMatrix(tetromino.shape.length, tetromino.shape[0].length, (row: number, col: number) => {
        if (tetromino.shape[row][col] === 1) {
            tetromino.type == Bomb ? createCircle(parent, `id: ${tetromino.id}, row: ${row}, col: ${col}`, tetromino.x + col * Block.WIDTH, tetromino.y + row * Block.HEIGHT, tetromino.color) : createCube(parent, `id: ${tetromino.id}, row: ${row}, col: ${col}`, tetromino.x + col * Block.WIDTH, tetromino.y + row * Block.HEIGHT, tetromino.color); // You can adjust the fill color here
        }
    });
}

/**
* Moves a tetrimino to x and y coordinate
*
* @param currTetrominoElement current element
* @param x x coordinate
* @param y y coordinate
* @returns null
*/
function moveCube(currTetrominoElement: HTMLElement, x: number, y: number) {
    attr(currTetrominoElement, { x: `${x}`, y: `${y}` })
}

/**
 * Moves the currently active tetromino on the SVG canvas.
 *
 * @param parent - The SVG canvas parent element.
 * @param tetromino - The tetromino object to be moved.
 */
function moveCurrentTetromino(parent: SVGGraphicsElement &
    HTMLElement, tetromino: TetrominoObject) {
    traverseMatrix(4, 4, (row: number, col: number) => {
        // Update tetromino location, if it does not exist then create it
        if (tetromino.shape[row] && tetromino.shape[row][col] && tetromino.shape[row][col] === 1) {
            const currTetrominoElement = document.getElementById(`id: ${tetromino.id}, row: ${row}, col: ${col}`)!;

            currTetrominoElement ? moveCube(currTetrominoElement, tetromino.x + col * Block.WIDTH, tetromino.y + row * Block.HEIGHT) :
                createCube(parent, `id: ${tetromino.id}, row: ${row}, col: ${col}`, tetromino.x + col * Block.WIDTH, tetromino.y + row * Block.HEIGHT, tetromino.color);
            // Delete redundant tetormino cubes
        } else {
            deleteElementById(`id: ${tetromino.id}, row: ${row}, col: ${col}`);
        }
    })
}

/**
 * Either places a new tetromino or moves the current one on the SVG canvas.
 *
 * @param parent - The SVG canvas parent element.
 * @param tetromino - The tetromino object to be handled.
 */
export function printTetromino(parent: SVGGraphicsElement &
    HTMLElement, tetromino: TetrominoObject) {
    if (not(isNotNullOrUndefined)(tetromino.shape[0]) || !tetromino.shape[0].length) {
        deleteOldTetromino(tetromino.id!, "previewId");
        return;
    }

    tetrominoDoesExists(tetromino) ? printNewTetromino(parent, tetromino) : moveCurrentTetromino(parent, tetromino);
}

/**
 * Handles game ending logic, cleaning up the SVG canvas.
 *
 * @param s - The current game state.
 */
export function endGame(s: State) {
    if (s.gameEnd) {
        const svgCanvas = document.getElementById('svgPreview')!;

        svgCanvas.childNodes.forEach(child => svgCanvas.removeChild(child));

        deleteOldTetromino(s.currentTetromino.id! + 1, "id");
    }
}
