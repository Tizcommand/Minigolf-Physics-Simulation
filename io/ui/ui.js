/**
 * Provides functions for initializing, updating and drawing various text, buttons and sliders.
 */

/* buttons */

/**
 * @type {boolean}
 */
let showPhysicsSettings = false;

/**
 * @type {Button}
 */
let newButton;

/**
 * @type {Button}
 */
let resetButton;

/**
 * @type {Button}
 */
let physicsSettingsButton;

/**
 * @type {Button}
 */
let defaultSettingsButton;

/**
 * @type [Button]
 */
let alwaysVisibleButtons;

/* sliders */

/**
 * @type {Slider}
 */
let gravitySlider;

/**
 * @type {Slider}
 */
let airDensitySlider;

/**
 * @type {Slider}
 */
let diameterSlider;

/**
 * @type {Slider}
 */
let massSlider;

/**
 * @type {Slider}
 */
let rollResistanceSlider;

/**
 * @type [Slider]
 */
let physicsSettingsSliders;

/**
 * Initializes all the UI's buttons and sliders.
 */
function initializeUi() {
    // always visible buttons
    let x = CANVAS_C_W / 2 - 2.25;
    let y = getTopBorderY() - 0.7;
    let w = 1.5;
    let h = 0.37;
    newButton = new Button(x, y, w, h, "NEW TRY", 0.05, CL_GRN, CL_DRK_GRN, newTry);

    x = CANVAS_C_W / 2 + 0.75;
    resetButton = new Button(x, y, w, h, "RESET", 0.05, CL_RD, CL_DRK_RD, resetGame);

    x = getRightBorderX() - 2;
    y = getTopBorderY() - 0.2;
    w = 1.25;
    h = 0.2;
    let text = "PHYSICS SETTINGS";
    physicsSettingsButton = new Button(x, y, w, h, text, 0.02, CL_BLU, CL_DRK_BLU, togglePhysicsSettings);

    alwaysVisibleButtons = [newButton, resetButton, physicsSettingsButton];

    // default physics settings button
    y = getTopBorderY() - 2.1;
    text = "DEFAULT SETTINGS";
    defaultSettingsButton = new Button(x, y, w, h, text, 0.02, CL_BLU, CL_DRK_BLU, resetPhysicsSettings);

    // physics settings sliders
    gravitySlider = new Slider(
        0, 0, 1, 0.1, "", 1, CL_BLU, 0.02, updateGravity
    );

    airDensitySlider = new Slider(
        0, 0, 1, 0.1, "", 1, CL_BLU, 0.02, updateAirDensity
    );

    diameterSlider = new Slider(
        0, 0, 1, 0.1, "", 1, CL_BLU, 0.02, updateBallDiameter
    );

    massSlider = new Slider(
        0, 0, 1, 0.1, "", 1, CL_BLU, 0.02, updateBallMass
    );

    rollResistanceSlider = new Slider(
        0, 0, 1, 0.1, "", 1, CL_BLU, 0.02, updateBallRollResistanceCoefficient
    );
    rollResistanceSlider.indicatorValue = 1/6;

    physicsSettingsSliders = [
        gravitySlider, airDensitySlider, diameterSlider, massSlider, rollResistanceSlider
    ];
}

/**
 * Updates all button's and slider's text and positions.
 *
 * The positions are updated based on the canvas's current size.
 *
 * @param delta
 * How many seconds passed between this and the last frame.
 */
function updateUi(delta) {
    updateArrows(delta);
    updateTutorial(delta);

    newButton.setY(getTopBorderY() - 0.7);
    resetButton.setY(getTopBorderY() - 0.7);
    physicsSettingsButton.setY(getTopBorderY() - 0.2);

    if(showPhysicsSettings) {
        gravitySlider.setX(getRightBorderX() - 2.5);
        gravitySlider.setY(getTopBorderY() - 0.75);
        gravitySlider.text = "Gravity: " + gravityMultiplier.toFixed(2) + "x";

        airDensitySlider.setX(getRightBorderX() - 2.5);
        airDensitySlider.setY(getTopBorderY() - 1.25);
        airDensitySlider.text = "Air Density: " + airDensity.toFixed(2) + "kg/m³";

        diameterSlider.setX(getRightBorderX() - 1.25);
        diameterSlider.setY(getTopBorderY() - 0.75);
        diameterSlider.text = "Ball Diameter: " + ball.body.diameter.toFixed(2) + "m";

        massSlider.setX(getRightBorderX() - 1.25);
        massSlider.setY(getTopBorderY() - 1.25);
        massSlider.text = "Ball Mass: " + ball.mass.toFixed(2) + "kg";

        rollResistanceSlider.setX(getRightBorderX() - 1.25);
        rollResistanceSlider.setY(getTopBorderY() - 1.75);
        let str = "Ball Rolling Resistance\nCoefficient: ";
        rollResistanceSlider.text = str + ball.rollResistanceCoefficient.toFixed(4);

        defaultSettingsButton.setY(getTopBorderY() - 2.1);
    }

    if(mouseIsPressed) {
        alwaysVisibleButtons.forEach((button) => {
            button.update();
        });

        if(showPhysicsSettings) {
            physicsSettingsSliders.forEach((slider) => {
                slider.update();
            })

            defaultSettingsButton.update();
        }
    }
}

/**
 * Toggles the visibility of the physics settings.
 */
function togglePhysicsSettings() {
    showPhysicsSettings = !showPhysicsSettings;
}

/**
 * Sets all physics settings sliders indicators to their default positions.
 */
function resetPhysicsSettings() {
    gravitySlider.setIndicator(0.5);
    airDensitySlider.setIndicator(0.5);
    diameterSlider.setIndicator(0.5);
    massSlider.setIndicator(0.5);
    rollResistanceSlider.setIndicator(1/6);
}

/**
 * Draws all text, buttons and sliders of the UI.
 */
function drawUi() {
    drawUiText();

    alwaysVisibleButtons.forEach((button) => {
        button.draw();
    });

    if(showPhysicsSettings) {
        physicsSettingsSliders.forEach((slider) => {
            slider.draw();
        })

        defaultSettingsButton.draw();
    }
}

/**
 * Calls all button and slider press methods.
 *
 * @see Button.mousePressed
 * @see Slider.mousePressed
 */
function PressUi() {
    alwaysVisibleButtons.forEach((button) => {
        button.mousePressed();
    })

    if(showPhysicsSettings) {
        physicsSettingsSliders.forEach((slider) => {
            slider.mousePressed();
        })

        defaultSettingsButton.mousePressed();
    }
}

/**
 * Calls all button and slider release methods.
 *
 * @see Button.mouseReleased
 * @see Slider.mouseReleased
 */
function releaseUi() {
    alwaysVisibleButtons.forEach((button) => {
        button.mouseReleased();
    })

    if(showPhysicsSettings) {
        physicsSettingsSliders.forEach((slider) => {
            slider.mouseReleased();
        })

        defaultSettingsButton.mouseReleased();
    }
}