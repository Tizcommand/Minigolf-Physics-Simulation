/**
 * @param x {number}
 * The x coordinate of the triangle's top left corner.
 *
 * @param y {number}
 * The y coordinate of the triangle's top left corner.
 *
 * @param w {number}
 * The width of the triangle.
 *
 * @param h {number}
 * The height of the triangle.
 *
 * @param color {string}
 * The color of the triangle in HTML notation.
 *
 * @param direction {number}
 * Determines the position of the 90° corner using the constant DIR_TP_RGT, DIR_TP_LFT, DIR_BTM_RGT or DIR_BTM_LFT.
 *
 * @returns {Triangle}
 * A new right-angled triangle.
 */
function getRightTriangle(
    x, y, w, h, color, direction
) {
    switch(direction) {
        case DIR_TP_RGT:
            return new Triangle(x, y, x + w, y, x + w, y - h, color);
        case DIR_TP_LFT:
            return new Triangle(x, y, x + w, y, x, y - h, color);
        case DIR_BTM_RGT:
            return new Triangle(x, y - h, x + w, y, x + w, y - h, color);
        case DIR_BTM_LFT:
            return new Triangle(x, y, x, y - h, x + w, y - h, color);
    }
}

/**
 * @param x {number}
 * The x coordinate of the corner connecting the two legs of the triangle.
 *
 * @param y {number}
 * The y coordinate of the corner connecting the two legs of the triangle.
 *
 * @param width {number}
 * How many meters space are between the base and the corner connecting the two legs of the triangle.
 *
 * @param base {number}
 * How many meters long the base of the triangle are.
 *
 * @param color {string}
 * The color of the triangle in HTML notation.
 *
 * @param angle {number}
 * By how many degrees the base of the triangle is rotated around the corner connecting the two legs of the
 * triangle. At 0 degrees the base of the triangle is pointed to the right. A positive angle rotates the base
 * counterclockwise, a negative angle clockwise.
 *
 * @returns {Triangle}
 * A new isosceles triangle.
 */
function getIsoscelesTriangle(
    x, y, width, base, color, angle
) {
    let baseMiddle = createVector(width, 0);
	baseMiddle.rotate(radians(angle));

	let baseTop = createVector(baseMiddle.x, baseMiddle.y);
	baseTop.rotate(HALF_PI);
	baseTop.setMag(base / 2);
	baseTop.add(baseMiddle);
	baseTop.add(x, y);

	let baseBottom = createVector(baseMiddle.x, baseMiddle.y);
	baseBottom.rotate(-HALF_PI);
	baseBottom.setMag(base / 2);
	baseBottom.add(baseMiddle);
	baseBottom.add(x, y);
    
    return new Triangle(x, y, baseTop.x, baseTop.y, baseBottom.x, baseBottom.y, color);
}

/**
 * A colored triangle that can be drawn to the canvas.
 */
class Triangle {
    /**
     * Returns a new triangle object.
     *
     * @param x1 {number}
     * The triangle's first corner's x coordinate.
     *
     * @param y1 {number}
     * The triangle's first corner's y coordinate.
     *
     * @param x2 {number}
     * The triangle's second corner's x coordinate.
     *
     * @param y2 {number}
     * The triangle's second corner's y coordinate.
     *
     * @param x3 {number}
     * The triangle's third corner's x coordinate.
     *
     * @param y3 {number}
     * The triangle's third corner's y coordinate.
     *
     * @param color {string}
     * The color of the triangle in HTML notation.
     */
    constructor(x1, y1, x2, y2, x3, y3, color) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.x3 = x3;
        this.y3 = y3;
        this.color = color;
    }

    /**
     * Draws this triangle to the canvas.
     */
    draw() {
        let x1 = transformCxToPx(this.x1);
        let y1 = transformCyToPy(this.y1);
        let x2 = transformCxToPx(this.x2);
        let y2 = transformCyToPy(this.y2);
        let x3 = transformCxToPx(this.x3);
        let y3 = transformCyToPy(this.y3);
        
        fill(this.color);
        triangle(x1, y1, x2, y2, x3, y3);
    }
}