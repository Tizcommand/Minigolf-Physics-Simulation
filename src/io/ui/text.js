/**
 * Provides functions for building strings and drawing them to the screen.
 * @author Tizian Kirchner
 */

/**
 * Stores how many frames are being drawn to the canvas per second.
 *
 * Shorthand for "frames per second".
 *
 * @type {number}
 */
let fps = 0;

/**
 * Used for counting the number of frames drawn to the canvas in the current second.
 *
 * @type {number}
 */
let frameCounter = 0;

/**
 * Used by the {@link updateFPS} function to check when 1 second has passed.
 *
 * @type {number}
 */
let fpsRefreshTimer = 0;

/**
 * @returns {string}
 * A string containing information about the current {@link fps}, wind speed and {@link tries}.
 * Adds the {@link ball}'s velocity and position to the string when {@link DEBUG} mode is activated.
 *
 * @see windVelocity
 * @see successfulTries
 */
function getInfoText() {
    let infoText = (
        "FPS: " + fps +
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
 * Updates the {@link fps}, {@link frameCounter} and {@link fpsRefreshTimer} variables.
 *
 * @param delta {number} How many seconds passed between the current and the last frame.
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
 * The position of the text's anchor is specified via the {@link textAlign} function.
 *
 * @param str {string}
 * Determines the string to draw to the canvas.
 *
 * @param x {number}
 * Determines the x position of the text's anchor.
 *
 * @param y {number}
 * Determines the y position of the text's anchor.
 *
 * @param color {string}
 * Determines the color of the text in HTML notation.
 *
 * @param size {number}
 * Determines the size of the text in meters.
 *
 * @param [maxW] {number}
 * Determines the maximum width of the text. When the text reaches this width, a line break is applied.
 *
 * @param [maxH] {number}
 * Determines the maximum height of the text. Text which reaches beyond this height is not visible.
 *
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
 * Draws the simulation's title and the info text to the canvas.
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
 * @param vector {Vector}
 * The {@link Vector} to convert to a string.
 *
 * @returns {string}
 * The {@link Vector}'s x and y components in a short string.
 */
function vectorToShortString(vector) {
    return "(" + vector.x + "; " + vector.y + ")";
}

/**
 * @param vector {p5.Vector}
 * The {@link Vector} to convert to a string.
 *
 * @returns {string}
 * The {@link Vector}'s x and y components in a short string,
 * showing only two decimal places for the x and y coordinates.
 */
function vectorToFixedString(vector) {
    return "(" + vector.x.toFixed(2) + "; " + vector.y.toFixed(2) + ")";
}