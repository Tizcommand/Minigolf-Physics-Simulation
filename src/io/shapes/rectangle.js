/**
 * A colored rectangle that can be drawn to the canvas.
 * @author Tizian Kirchner
 */
class Rectangle {
    /**
     * This {@link Rectangle}'s top left corner's x position.
     * @type {number}
     */
    x;

    /**
     * This {@link Rectangle}'s top left corner's y position.
     * @type {number}
     */
    y;

    /**
     * This {@link Rectangle}'s width in meters.
     * @type {number}
     */
    w;

    /**
     * This {@link Rectangle}'s height in meters.
     * @type {number}
     */
    h;

    /**
     * The color of this {@link Rectangle} in HTML notation.
     * @type {string}
     */
    color;

    /**
     * Returns a new {@link Rectangle} object.
     *
     * @param x {number}
     * See {@link Rectangle.x}.
     *
     * @param y {number}
     * See {@link Rectangle.y}.
     *
     * @param w {number}
     * See {@link Rectangle.w}.
     *
     * @param h {number}
     * See {@link Rectangle.h}.
     *
     * @param color {string}
     * See {@link Rectangle.color}.
     */
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }

    /**
     * Draws this {@link Rectangle} to the canvas.
     */
    draw() {
        let x = transformCxToPx(this.x);
        let y = transformCyToPy(this.y);
        let width = this.w * canvasScale;
        let height = this.h * canvasScale;
        
        fill(this.color);
        rectMode(CORNER);
        rect(x, y, width, height);
    }

    /**
     * @returns {boolean} If this {@link Rectangle} is behind the mouse cursor.
     */
    isBehindCursor() {
        return (
            mouseX < transformCxToPx(this.x + this.w) &&
            mouseX > transformCxToPx(this.x) &&
            mouseY < (transformCyToPy(this.y) + this.h * canvasScale) &&
            mouseY > transformCyToPy(this.y)
        );
    }

    /**
     * @returns {number} This {@link Rectangle}'s left border's x coordinate.
     */
    getLeftX() {
        return this.x;
    }

    /**
     * @returns {number} This {@link Rectangle}'s right border's x coordinate.
     */
    getRightX() {
        return this.x + this.w;
    }

    /**
     * @returns {number} This {@link Rectangle}'s top border's y coordinate.
     */
    getTopY() {
        return this.y;
    }

    /**
     * @returns {number} This {@link Rectangle}'s bottom border's y coordinate.
     */
    getBottomY() {
        return this.y - this.h;
    }
}