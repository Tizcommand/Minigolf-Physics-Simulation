/**
 * A button which triggers a function upon being clicked.
 *
 * Displayed as a {@link Rectangle} with a border using the canvas's {@link fgCl foreground color}.
 * Text can be displayed on the {@link Rectangle}.
 * Upon the mouse cursor hovering over the button and a mouse button being held,
 * the button changes its color temporarily.
 *
 * @author Tizian Kirchner
 */
class Button extends Rectangle{
    /* Visuals */

    /**
     * The text displayed on this {@link Button}'s surface.
     * @type {string}
     */
    text ;

    /**
     * The thickness of this {@link Button}'s border in meters.
     * @type {number}
     */
    borderWeight;

    /**
     * The default color of this {@link Button} in HTML notation.
     * @type {string}
     */
    clDefault;

    /**
     * The color this {@link Button} has while being pressed. Must be in HTML notation.
     * @type {string}
     */
    clPressed;

    /* Inner Rectangle */

    /**
     * This {@link Button}'s inner rectangle's top left corner's x position.
     * @type {number}
     */
    innerX;

    /**
     * This {@link Button}'s inner rectangle's top left corner's y position.
     * @type {number}
     */
    innerY;

    /**
     * This {@link Button}'s inner rectangle's width in meters.
     * @type {number}
     */
    innerW;

    /**
     * This {@link Button}'s inner rectangle's height in meters.
     * @type {number}
     */
    innerH;

    /* Misc */

    /**
     * The function this {@link Button} calls after it has been clicked.
     * @type {Function}
     */
    func;

    /**
     * Determines if this {@link Button} is currently being pressed.
     * @type {boolean}
     */
    pressed;

    /**
     * Constructs a new {@link Button} object.
     *
     * @param x {number}
     * This button's top left corner's x position.
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
     * See {@link Button.text}.
     *
     * @param borderWeight {number}
     * See {@link Button.borderWeight}.
     *
     * @param clDefault {string}
     * See {@link Button.clDefault}.
     *
     * @param clPressed {string}
     * See {@link Button.clPressed}.
     *
     * @param func {Function}
     * See {@link Button.func}.
     */
    constructor(
        x, y, w, h,
        text, borderWeight, clDefault, clPressed, func
    ) {
        super(x, y, w, h, clDefault);

        this.text = text;
        this.borderWeight = borderWeight;
        this.clDefault = clDefault;
        this.clPressed = clPressed;

        this.innerX = this.x + this.borderWeight;
        this.innerY = this.y - this.borderWeight;
        this.innerW = this.w - 2 * this.borderWeight;
        this.innerH = this.h - 2 * this.borderWeight;

        this.func = func;
        this.pressed = false;
    }

    /**
     * Draws this {@link Button} to the canvas.
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
     * Changes this {@link Button}'s {@link color} to {@link clPressed} and the {@link pressed} field to true,
     * if this {@link Button} has been pressed.
     */
    mousePressed() {
        if(this.isBehindCursor()) {
            this.color = this.clPressed;
            this.pressed = true;
        }
    }

    /**
     * Changes this {@link Button}'s {@link color} accordingly to whether the {@link pressed} field is true or false.
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
     * Calls this {@link Button}'s {@link func function} if a mouse button has been released
     * while the mouse cursor was hovering over this button.
     * Sets this {@link Button}'s {@link color} to its {@link clDefault default Color} and
     * the {@link pressed} variable to false.
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
     * Sets this {@link Button}'s top left corner's x position and
     * adjust its {@link innerX} position accordingly.
     *
     * @param x
     * This {@link Button}'s top left corner's new x position.
     */
    setX(x) {
        this.x = x;
        this.innerX = this.x + this.borderWeight;
    }

    /**
     * Sets this {@link Button}'s top left corner's y position and
     * adjust its {@link innerY} position accordingly.
     *
     * @param y
     * This {@link Button}'s top left corner's new y position.
     */
    setY(y) {
        this.y = y;
        this.innerY = this.y - this.borderWeight;
    }
}