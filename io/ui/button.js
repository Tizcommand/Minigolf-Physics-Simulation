/**
 * A clickable button which triggers a function upon being clicked.
 *
 * Displayed as a rectangle with a border using the canvas's foreground color. Text can be displayed on the
 * rectangle. Upon the mouse cover hovering over the button and a button being held, the button changes
 * its color temporarily.
 *
 * @see fgCl
 */
class Button extends Rectangle{
    /**
     * Returns a new button object.
     *
     * @param x {number}
     * The button's top left corner's x position.
     *
     * @param y {number}
     * The button's top left corner's y position.
     *
     * @param w {number}
     * The button's width in meters.
     *
     * @param h {number}
     * The button's height in meters.
     *
     * @param text {string}
     * The text displayed on the button's surface.
     *
     * @param borderWeight {number}
     * The thickness of the button's border in meters.
     *
     * @param clDefault {string}
     * The default color of the button in HTML notation.
     *
     * @param clPressed {string}
     * The color the button has while being pressed. Must be in HTML notation.
     *
     * @param func {Function}
     * The function the button calls after it has been clicked.
     */
    constructor(
        x, y, w, h,
        text, borderWeight, clDefault, clPressed, func
    ) {
        super(x, y, w, h, clDefault);

        /**
         * The default color of this button in HTML notation.
         * @type {string}
         */
        this.clDefault = clDefault;

        /**
         * The color this button has while being pressed. Must be in HTML notation.
         * @type {string}
         */
        this.clPressed = clPressed;

        /**
         * The text displayed on this button's surface.
         * @type {string}
         */
        this.text = text;

        /**
         * The thickness of this button's border in meters.
         * @type {number}
         */
        this.borderWeight = borderWeight;

        /**
         * The function this button calls after it has been clicked.
         * @type {Function}
         */
        this.func = func;

        /**
         * Determines if this button is being currently pressed.
         * @type {boolean}
         */
        this.pressed = false;

        /**
         * This button's inner rectangle's top left corner's x position.
         * @type {number}
         */
        this.innerX = this.x + this.borderWeight;

        /**
         * This button's inner rectangle's top left corner's y position.
         * @type {number}
         */
        this.innerY = this.y - this.borderWeight;

        /**
         * This button's inner rectangle's width in meters.
         * @type {number}
         */
        this.innerW = this.w - 2 * this.borderWeight;

        /**
         * This button's inner rectangle's height in meters.
         * @type {number}
         */
        this.innerH = this.h - 2 * this.borderWeight;
    }

    /**
     * Draws this button to the canvas.
     */
    draw() {
	    stroke(fgCl);
        strokeWeight(this.borderWeight * canvasScale);
        let x = this.innerX;
        let y = this.innerY

	    new Rectangle(x, y, this.innerW, this.innerH, this.color).draw();

        textAlign(CENTER, TOP);
	    strokeWeight(0);
        x = this.innerX + this.innerW / 2;
        y = this.innerY - this.h * 0.15;

	    drawString(this.text, x, y, fgCl, this.innerH * 0.75);
    }

    /**
     * Changes this button's color to clPressed and the pressed variable to true, if this button has been
     * pressed.
     *
     * @see Button.clPressed
     * @see Button.pressed
     */
    mousePressed() {
        if(this.isBehindCursor()) {
            this.color = this.clPressed;
            this.pressed = true;
        }
    }

    /**
     * Changes the button's color accordingly to whether it is still being pressed.
     */
    update() {
        if(this.pressed) {
            if(this.isBehindCursor()) {
                this.color = this.clPressed;
            } else {
                this.color = this.clDefault;
            }
        }
    }

    /**
     * Calls this button's function if a mouse button has been released while the mouse cursor was hovering over
     * this button. Sets this button's color to its default color and the pressed variable to false.
     *
     * @see Button.pressed
     */
    mouseReleased() {
        if(this.isBehindCursor() && this.pressed) {
            this.func();
        }

        this.color = this.clDefault;
        this.pressed = false;
    }

    /**
     * Sets this button's top left corner's x position and adjust its innerX position accordingly.
     *
     * @param x
     * This button's new x position.
     *
     * @see Button.innerX
     */
    setX(x) {
        this.x = x;
        this.innerX = this.x + this.borderWeight;
    }

    /**
     * Sets this button's top left corner's y position and adjust its innerY position accordingly.
     *
     * @param y
     * This button's new y position.
     *
     * @see Button.innerY
     */
    setY(y) {
        this.y = y;
        this.innerY = this.y - this.borderWeight;
    }
}