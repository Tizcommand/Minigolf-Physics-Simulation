/**
 * A colored circle that can be drawn to the canvas.
 */
class Circle {
    /**
     * Returns a new circle object.
     *
     * @param position {p5.Vector}
     * The x and y coordinates of the circle's center.
     *
     * @param diameter {number}
     * How many meters wide and tall the circle is.
     *
     * @param color {string}
     * The color of the circle in HTML notation.
     */
    constructor(position, diameter, color) {
        this.position = position;
        this.diameter = diameter;
        this.color = color;
    }

    /**
     * Draws this circle to the canvas.
     */
    draw() {
        let x = transformCxToPx(this.position.x);
        let y = transformCyToPy(this.position.y);
        let diameter = this.diameter * canvasScale;
        
        fill(this.color);
        circle(x, y, diameter);
    }

    /**
     * @returns {number}
     * This circle's radius.
     */
    getRadius() {
        return this.diameter / 2;
    }

    /**
     * @returns {number}
     * This circle's left border's x coordinate.
     */
    getLeftX() {
        return this.position.x - this.getRadius();
    }

    /**
     * @returns {number}
     * This circle's right border's x coordinate.
     */
    getRightX() {
        return this.position.x + this.getRadius();
    }

    /**
     * @returns {number}
     * This circle's top border's y coordinate.
     */
    getTopY() {
        return this.position.y + this.getRadius();
    }

    /**
     * @returns {number}
     * This circle's bottom border's y coordinate.
     */
    getBottomY() {
        return this.position.y - this.getRadius();
    }
}