/**
 * Provides functions and building strings and drawing them to the screen
 */

/**
 * How many frames are being drawn to the canvas per second.
 *
 * Shorthand for "frames per second".
 *
 * @type {number}
 */
let fps = 0;

/**
 * Used for counting the number frames drawn to the canvas in the current second.
 *
 * @type {number}
 */
let frameCounter = 0;

/**
 * Used by the updateFPS function to check, when 1 second has passed.
 *
 * @type {number}
 * @see updateFPS
 */
let fpsRefreshTimer = 0;

/**
 * @returns {string}
 * A string containing information about the current fps, wind speed and tries. Additionally, prints the golf ball's
 * speed and position when debug mode is activated.
 *
 * @see DEBUG
 */
function getInfoText() {
    let infoText = (
        "FPS: " + fps + " " +
        "\nWind Speed: " + abs(windVelocity.x).toFixed(2) + "㎧" +
        "\nSuccessful Tries: " + successfulTries + "/" + tries
    );

    if(DEBUG) infoText += (
        "\nBall Speed: " + vectorToFixedString(ball.velocity) + "㎧" +
        "\nBall Position: " + vectorToFixedString(ball.body.position)
    );

    return infoText;
}

/**
 * Updates the fps, frameCounter and fpsRefreshTimer variables.
 *
 * @param delta {number} How many seconds passed between the current and the last frame.
 * @see fps
 * @see frameCounter
 * @see fpsRefreshTimer
 */
function updateFPS(delta) {
    frameCounter++;
    fpsRefreshTimer += delta;

    if(fpsRefreshTimer >= 1) {
        fps = frameCounter;
        frameCounter = 0;
        fpsRefreshTimer -= 1;
    }
}

/**
 * Draws a string as text to the canvas.
 *
 * The position of the text's anchor is specified via the textAlign function.
 *
 * @param str {string}
 * The string to draw to the canvas.
 *
 * @param x {number}
 * The x position of the text's anchor.
 *
 * @param y {number}
 * The y position of the text's anchor.
 *
 * @param color {string}
 * The color of the text in HTML notation.
 *
 * @param size {number}
 * The size of the text in meters.
 *
 * @param [maxW] {number}
 * The maximum width of the text. When the text reaches this width, a line break is applied.
 *
 * @param [maxH] {number}
 * The maximum height of the text. Text which reaches beyond this height is not visible.
 *
 * @see textAlign
 * @see canvasScale
 */
function drawString(
    str, x, y, color, size, maxW, maxH
) {
    x = transformCxToPx(x);
    y = transformCyToPy(y);

    fill(color);
    textSize(size * canvasScale);
    if(maxW !== undefined && maxH !== undefined) {
        maxW = maxW * canvasScale;
        maxH = maxH * canvasScale;
        text(str, x, y, maxW, maxH);
    } else {
        text(str, x, y);
    }
}

/**
 * Draws the simulations title and the info text to the canvas.
 *
 * @see getInfoText
 */
function drawUiText() {
    // title text
    textFont('Century Gothic');
    textAlign(CENTER, TOP);
    drawString("Minigolf Physics Simulation", CANVAS_C_W / 2, getTopBorderY() - 0.2, fgCl, 0.35);

    // info text
    textAlign(LEFT, TOP);
    drawString(getInfoText(), getLeftBorderX() + 0.30, getTopBorderY() - 0.05, fgCl, 0.15);
}

/**
 * @param vector {p5.Vector}
 * The vector to convert to a string.
 *
 * @returns {string}
 * The vector's x and y coordinate in a short string.
 */
function vectorToShortString(vector) {
    return "(" + vector.x + "; " + vector.y + ")";
}

/**
 * @param vector {p5.Vector}
 * The vector to convert to a string.
 *
 * @returns {string}
 * The vector's x and y coordinate in a short string, showing only two decimal places for the x and y coordinates.
 */
function vectorToFixedString(vector) {
    return "(" + vector.x.toFixed(2) + "; " + vector.y.toFixed(2) + ")";
}