/**
 * A colored circle that can be drawn to the canvas.
 * @author Tizian Kirchner
 */
class Circle {
    /**
     * The x and y coordinates of this circle's center.
     * @type {p5.Vector}
     */
    position;

    /**
     * How many meters wide and tall this circle is.
     * @type {number}
     */
    diameter;

    /**
     * The color of this circle in HTML notation.
     * @type {string}
     */
    color;

    /**
     * Constructs a new {@link Circle} object.
     *
     * @param position {p5.Vector}
     * See {@link Circle.position}.
     *
     * @param diameter {number}
     * See {@link Circle.diameter}.
     *
     * @param color {string}
     * See {@link Circle.color}.
     */
    constructor(position, diameter, color) {
        this.position = position;
        this.diameter = diameter;
        this.color = color;
    }

    /**
     * Draws this {@link Circle} to the canvas.
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
     * This {@link Circle}'s radius.
     */
    getRadius() {
        return this.diameter / 2;
    }

    /**
     * @returns {number}
     * This {@link Circle}'s left border's x coordinate.
     */
    getLeftX() {
        return this.position.x - this.getRadius();
    }

    /**
     * @returns {number}
     * This {@link Circle}'s right border's x coordinate.
     */
    getRightX() {
        return this.position.x + this.getRadius();
    }

    /**
     * @returns {number}
     * This {@link Circle}'s top border's y coordinate.
     */
    getTopY() {
        return this.position.y + this.getRadius();
    }

    /**
     * @returns {number}
     * This {@link Circle}'s bottom border's y coordinate.
     */
    getBottomY() {
        return this.position.y - this.getRadius();
    }
}