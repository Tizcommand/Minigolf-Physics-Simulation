/**
 * Has a circle-shaped indicator which can be slided left and right.
 *
 * The Slider's main body is displayed as a {@link Rectangle}.
 * Half-{@link Circle}s are visualizing the Slider's left and right endings.
 * The main body and the endings are enclosed by a border, using the canvas's {@link fgCl foreground color}.
 * An indicatorValue field is provided by the Slider, which can be used to scale other values.
 * Text can be displayed above the Slider. While the mouse cursor is moving the indicator,
 * the Slider will call a function defined through the constructor.
 *
 * @author Tizian Kirchner
 */
class Slider extends Rectangle{
    /* Text */

    /**
     * The text displayed above this {@link Slider}.
     * @type {string}
     */
    text;

    /**
     * Multiplier for this {@link Slider}'s {@link text}'s size.
     *
     * The standard size for the {@link text} is this {@link Slider}'s height.
     *
     * @type {number}
     */
    textScale;

    /* Visualisation */

    /**
     * Visualizes this Slider's main body.
     * @type {Rectangle}
     */
    innerRec;

    /**
     * Visualizes this Slider's left ending.
     * @type {Circle}
     */
    innerLftCircle;

    /**
     * Visualizes this Slider's right ending.
     * @type {Circle}
     */
    innerRgtCircle;

    /* Border */

    /**
     * The thickness of this {@link Slider}'s border in meters.
     * @type {number}
     */
    borderWeight;

    /**
     * Visualizes this {@link Slider}'s main body's border.
     * @type {Rectangle}
     */
    outerRec;

    /**
     * Visualizes this {@link Slider}'s left ending's border.
     * @type {Circle}
     */
    outerLftCircle;

    /**
     * Visualizes this {@link Slider}'s right ending's border.
     * @type {Circle}
     */
    outerRgtCircle;

    /* Indicator */

    /**
     * A Circle which visualizes this {@link Slider}'s indicator.
     * @type {Circle}
     */
    indicator;

    /**
     * Determines the position of this {@link Slider}'s {@link indicator}.
     *
     * 0 means the {@link indicator} is at the left ending of this {@link Slider},
     * while 1 means the {@link indicator} is at the right ending of this {@link Slider}.
     *
     * Can be used to scale other values.
     *
     * @type {number}
     */
    indicatorValue;

    /* Misc */

    /**
     * The function this {@link Slider} calls while the {@link indicator} is being moved by the mouse cursor.
     * @type {Function}
     */
    func;

    /**
     * Determines if this {@link Slider} is being pressed through the mouse cursor.
     * @type {boolean}
     */
    pressed;

    /**
     * Constructs a new {@link Slider} object.
     *
     * The {@link Slider}'s {@link text}'s size is determined through the product of the {@link Slider}'s
     * height's times the {@link textScale} multiplier.
     *
     * @param x {number}
     * The {@link Slider}'s top left corner's x position.
     *
     * @param y {number}
     * The {@link Slider}'s top left corner's y position.
     *
     * @param w {number}
     * The {@link Slider}'s width in meters.
     *
     * @param h {number}
     * The {@link Slider}'s height in meters.
     *
     * @param text {string}
     * See {@link Slider.text}.
     *
     * @param textScale {number}
     * See {@link Slider.textScale}.
     *
     * @param color {string}
     * The {@link Slider}'s color in HTML notation.
     *
     * @param borderWeight {number}
     * See {@link Slider.borderWeight}.
     *
     * @param func {Function}
     * See {@link Slider.func}.
     */
    constructor(
        x, y, w, h,
        text, textScale, color, borderWeight, func
    ) {
        super(x, y, w, h, color);

        this.text = text;
        this.textScale = textScale;
        this.borderWeight = borderWeight;
        this.func = func;
        this.indicatorValue = 0.5;
        this.pressed = false;

        this.updateShapes();
    }

    /**
     * Changes the {@link pressed} variable to true if this {@link Slider} has been pressed.
     */
    mousePressed() {
        if(this.isBehindCursor()) {
            this.pressed = true;
        }
    }

    /**
     * Adjusts the {@link indicatorValue} according to where the mouse is moving the {@link indicator}.
     */
    update() {
        if(this.pressed) {
            this.indicatorValue = (transformPxToCx(mouseX) - this.x) / this.w;

            if(this.indicatorValue < 0) {
                this.indicatorValue = 0;
            } else if(this.indicatorValue > 1) {
                this.indicatorValue = 1;
            }

            this.func();
        }
    }

    /**
     * Changes the {@link pressed} variable to false.
     */
    mouseReleased() {
        this.pressed = false;
    }

    /**
     * Updates the shapes being used to display this slider according to the x, y, w, h values.
     */
    updateShapes() {
        let innerY = this.y - this.borderWeight;
        let innerH = this.h - 2 * this.borderWeight;

        this.outerRec = new Rectangle(this.x, this.y, this.w, this.h, fgCl);
        this.outerLftCircle = new Circle(createVector(this.x, this.y - this.h / 2), this.h, fgCl);
        this.outerRgtCircle = new Circle(createVector(this.x + this.w, this.y - this.h / 2), this.h, fgCl);

        this.innerRec = new Rectangle(this.x, innerY, this.w, innerH, this.color);
        this.innerLftCircle = new Circle(createVector(this.x, innerY - innerH / 2), innerH, this.color);
        this.innerRgtCircle = new Circle(createVector(this.x + this.w, innerY - innerH / 2), innerH, this.color);

        let indicatorPosition = createVector(this.x + this.w * this.indicatorValue, this.y - this.h / 2);
        this.indicator = new Circle(indicatorPosition, this.h, fgCl);
    }

    /**
     * Draws this {@link Slider} to the canvas.
     */
    draw() {
        strokeWeight(0);

        this.outerRec.draw();
        this.outerLftCircle.draw();
        this.outerRgtCircle.draw();

        this.innerRec.draw();
        this.innerLftCircle.draw();
        this.innerRgtCircle.draw();

        this.indicator.draw();

        let hOffset = 1 + (this.text.match(/\n/g) || []).length * 1.25;

        textAlign(CENTER, TOP);
        drawString(this.text, this.x + this.w / 2, this.y + this.h * hOffset, fgCl, this.h * this.textScale);
    }

    /**
     * @returns {boolean} If this {@link Slider} is behind the mouse cursor.
     */
    isBehindCursor() {
        return (
            mouseX < transformCxToPx(this.x + this.h / 2 + this.w) &&
            mouseX > transformCxToPx(this.x - this.h / 2) &&
            mouseY < (transformCyToPy(this.y) + this.h * canvasScale) &&
            mouseY > transformCyToPy(this.y)
        );
    }

    /**
     * Sets this {@link Slider}'s top left corner's x position and
     * updates the shapes used to display this {@link Slider} accordingly.
     *
     * @param x This {@link Slider}'s top left corner's new x position.
     */
    setX(x) {
        this.x = x;
        this.updateShapes();
    }

    /**
     * Sets this {@link Slider}'s top left corner's y position and
     * updates the shapes used to display this {@link Slider} accordingly.
     *
     * @param y
     * This {@link Slider}'s top left corner's new y position.
     */
    setY(y) {
        this.y = y;
        this.updateShapes();
    }

    /**
     * Sets a new indicatorValue and calls this {@link Slider}'s {@link func function}.
     *
     * @param indicatorValue
     * See {@link Slider.indicatorValue}.
     */
    setIndicator(indicatorValue) {
        this.indicatorValue = indicatorValue;
        this.func();
    }
}