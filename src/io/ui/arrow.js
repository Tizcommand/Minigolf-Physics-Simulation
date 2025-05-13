/**
 * Provides functions drawing arrows swaying towards and away from the direction they are pointing at.
 * @author Tizian Kirchner
 */

/**
 * Determines what every arrow's current position in the swaying animation is.
 *
 * At values 0 and 1 the arrows are at their starting position.
 * At value 0.5 the arrow has moved furthest into the direction it is pointing at.
 * At value 1.5 the arrow has moved furthest into the opposite of the direction it is pointing at.
 *
 * @type {number}
 * @see drawAnimatedArrow
 */
let arrowAnimationState = 0;

/**
 * Updates the value of the {@link arrowAnimationState} variable.
 *
 * The value of {@link arrowAnimationState} is always kept between 0 and 2.
 *
 * @param {number} delta
 * By how many seconds the animation is advanced. After 2 seconds all arrows will have swayed, forward and back, once.
 */
function updateArrows(delta) {
    arrowAnimationState += delta;

    if(arrowAnimationState > 2) {
        arrowAnimationState -= 2;
    }
}

/**
 * Draws an animated arrow swaying towards and away from the direction it is pointing at.
 *
 * The position of the arrow's anchor is specified via the {@link textAlign} function.
 *
 * @param {number} x
 * Determines the x position of the arrow's anchor.
 *
 * @param {number} y
 * Determines the y position of the arrow's anchor.
 *
 * @param {string} color
 * Determines the color of the arrow in HTML notation.
 *
 * @param {number} size
 * Determines the size of the arrow in meters.
 *
 * @param {number} direction
 * Determines the direction the arrow points towards. Has to be one of the direction constants declared in canvas.js.
 *
 * @see textAlign
 * @see canvasScale
 */
function drawAnimatedArrow(x, y, color, size, direction) {
    let t = '';

    switch (direction) {
        case DIR_TP:
            t = '↑';
            y += sin(arrowAnimationState * PI * 2) / 4;
            break;
        case DIR_TP_RGT:
            t = '↗';
            y += sin(arrowAnimationState * PI * 2) / 4;
            x += sin(arrowAnimationState * PI * 2) / 4;
            break;
        case DIR_TP_LFT:
            t = '↖';
            y += sin(arrowAnimationState * PI * 2) / 4;
            x -= sin(arrowAnimationState * PI * 2) / 4;
            break;
        case DIR_BTM:
            t = '↓';
            y -= sin(arrowAnimationState * PI * 2) / 4;
            break;
        case DIR_BTM_RGT:
            t = '↘';
            y -= sin(arrowAnimationState * PI * 2) / 4;
            x += sin(arrowAnimationState * PI * 2) / 4;
            break;
        case DIR_BTM_LFT:
            t = '↙';
            y -= sin(arrowAnimationState * PI * 2) / 4;
            x -= sin(arrowAnimationState * PI * 2) / 4;
            break;
        case DIR_RGT:
            t = '→';
            x += sin(arrowAnimationState * PI * 2) / 4;
            break;
        case DIR_LFT:
            t = '←';
            x -= sin(arrowAnimationState * PI * 2) / 4;
            break;
    }

    drawString(t, x, y, color, size);
}