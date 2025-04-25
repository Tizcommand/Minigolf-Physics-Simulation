/**
 * Has a circle shaped indicator which can be slided left and right.
 *
 * Displayed as a rectangle with half circle left and right and a border, using the canvas's foreground color.
 * Provides an indicatorValue variable, which can be used to scale other values. Text can be displayed above the
 * slider. While the mouse cursor is moving the indicator, the slider will call a function defined through the
 * constructor.
 */
class Slider extends Rectangle{
    /**
     * Returns a new slider object.
     *
     * The slider's text's size is determined through the product of the slider's height's times the textScale
     * multiplier.
     *
     * @param x {number}
     * The slider's top left corner's x position.
     *
     * @param y {number}
     * The slider's top left corner's y position.
     *
     * @param w {number}
     * The slider's width in meters.
     *
     * @param h {number}
     * The slider's height in meters.
     *
     * @param text {string}
     * The text displayed above the slider.
     *
     * @param textScale {number}
     * Multiplier for the text's size.
     *
     * @param color {string}
     * The color of the slider in HTML notation.
     *
     * @param borderWeight {number}
     * The thickness of the slider's border in meters.
     *
     * @param func {Function}
     * The function the slider calls while the indicator is being moved by the mouse cursor.
     */
    constructor(
        x, y, w, h,
        text, textScale, color, borderWeight, func
    ) {
        super(x, y, w, h, color);

        /**
         * The text displayed above this button.
         * @type {string}
         */
        this.text = text;

        /**
         * Multiplier for the text's size.
         * @type {number}
         */
        this.textScale = textScale;

        /**
         * The thickness of the slider's border in meters.
         * @type {number}
         */
        this.borderWeight = borderWeight;

        /**
         * The function this slider calls while the indicator is being moved by the mouse cursor.
         * @type {Function}
         */
        this.func = func;

        /**
         * Determines the position of the slider's indicator. 0 means the indicator is at the left border of this
         * slider, while 1 means the indicator is at the right border of this slider.
         * @type {number}
         */
        this.indicatorValue = 0.5;

        /**
         * Determines if the indicator is currently being moved.
         * @type {boolean}
         */
        this.pressed = false;

        this.updateShapes();
    }

    /**
     * Changes the pressed variable to true, if this slider has been pressed.
     *
     * @see Slider.pressed
     */
    mousePressed() {
        if(this.isBehindCursor()) {
            this.pressed = true;
        }
    }

    /**
     * Adjust the indicatorValue according to where the mouse is moving the indicator.
     *
     * @see Slider.indicatorValue
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
     * Changes the pressed variable to false.
     *
     * @see Slider.pressed
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
     * Draws this slider to the canvas.
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
     * @returns {boolean} If this slider is behind the mouse cursor.
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
     * Sets this slider's top left corner's x position and updates the shapes used to display this button accordingly.
     *
     * @param x This slider's top left corner's new x position.
     */
    setX(x) {
        this.x = x;
        this.updateShapes();
    }

    /**
     * Sets this slider's top left corner's y position and updates the shapes used to display this button accordingly.
     *
     * @param y
     * This slider's top left corner's new y position.
     */
    setY(y) {
        this.y = y;
        this.updateShapes();
    }

    /**
     * Sets a new indicatorValue and calls this slider's function
     *
     * @param indicatorValue
     * The new indicatorValue.
     *
     * @see Slider.indicatorValue
     */
    setIndicator(indicatorValue) {
        this.indicatorValue = indicatorValue;
        this.func();
    }
}