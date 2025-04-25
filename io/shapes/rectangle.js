/**
 * A colored rectangle that can be drawn to the canvas.
 */
class Rectangle {
    /**
     * Returns a new rectangle object.
     *
     * @param x {number}
     * The rectangle's left top corner's x position.
     *
     * @param y {number}
     * The rectangle's left top corner's y position.
     *
     * @param w {number}
     * The rectangle's width in meters.
     *
     * @param h {number}
     * The rectangle's height in meters.
     *
     * @param color {string}
     * The color of the circle in HTML notation.
     */
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }

    /**
     * Draws this rectangle to the canvas.
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
     * @returns {boolean} If this rectangle is behind the mouse cursor.
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
     * @returns {number} This rectangle's left border's x coordinate.
     */
    getLeftX() {
        return this.x;
    }

    /**
     * @returns {number} This rectangle's right border's x coordinate.
     */
    getRightX() {
        return this.x + this.w;
    }

    /**
     * @returns {number} This rectangle's top border's y coordinate.
     */
    getTopY() {
        return this.y;
    }

    /**
     * @returns {number} This rectangle's bottom border's y coordinate.
     */
    getBottomY() {
        return this.y - this.h;
    }
}