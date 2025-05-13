/**
 * Contains and updates values related to the physics of the environment in which the simulation takes place.
 * Performs different physics calculations according to different states the simulation can be in, such as the
 * {@link ball} being attached to the spring or being released from the spring.
 *
 * @author Tizian Kirchner
 */

/* Physics */

/**
 * Net acceleration that is applied to objects on earth.
 *
 * @type {number}
 */
const STANDARD_GRAVITY = 9.81;

/**
 * How many meters an object must have moved into terrain before a collision is detected.
 *
 * @type {number}
 */
const COLLISION_THRESHOLD = 0.001;

/**
 * See {@link Ball.reflectInAir}.
 *
 * @type {number}
 */
const BOUNCING_THRESHOLD = 0.1;

/**
 * Determines how quickly objects fall down.
 *
 * @type {number}
 */
let gravity = STANDARD_GRAVITY;

/**
 * A multiplier used to adjust the effects of gravity.
 *
 * By modifying the value of `gravityMultiplier`, the strength of gravity can be scaled up or down.
 * A value greater than 1 increases the gravity force, while a value between 0 and 1 decreases it.
 * Setting it to 1 represents the default or standard gravity.
 *
 * @type {number}
 */
let gravityMultiplier = 1;

/**
 * Determines how strongly objects are affected by {@link windVelocity wind}.
 *
 * If the {@link windVelocity} is equal to the zero {@link Vector} this variable determines how strongly the air
 * slows down objects.
 *
 * @type {number}
 */
let airDensity = 1.3;

/**
 * Determines how strongly objects are affected by wind and in which direction wind pushed them.
 *
 * @type {Vector}
 */
let windVelocity;

/* Ball */

/**
 * Launched of the {@link catapult} by the user.
 *
 * The goal of the minigolf game is to land this ball in the hole on the left side of the terrain.
 *
 * @type {Ball}
 */
let ball;

/**
 * Determines if the {@link ball} is being pressed by the mouse cursor.
 *
 * @type {boolean}
 */
let ballPressed = false;

/**
 * Determines if the {@link ball} has been fully released by the spring above the {@link catapult}.
 *
 * @type {boolean}
 */
let ballTopStart = false;

/**
 * Determines if the {@link ball} has been fully released by the spring to the right of the {@link catapult}.
 *
 * @type {boolean}
 */
let ballRightStart = false;

/**
 * Determines if the {@link ball} has been fully released by the spring to the left of the {@link catapult}.
 *
 * @type {boolean}
 */
let ballLeftStart = false;

/* Administration */

/**
 * Determines if collision information is printed to the console and if terrain colliders are drawn.
 *
 * @type {boolean}
 */
const DEBUG = false;

/**
 * Determines how often the {@link ball} has been fully released by the spring since the {@link resetButton}
 * has been last pressed.
 *
 * @type {number}
 */
let tries = 0;

/**
 * Determines how often the {@link ball} landed in the hole, since the {@link resetButton}
 * has been last pressed.
 *
 * @type {number}
 */
let successfulTries = 0;

/**
 * Determines if the {@link ball} landed in the hole, since it has been released by the spring.
 *
 * @type {boolean}
 */
let success = false;

/* Simulation State */

/**
 * Forces the simulation of the a {@link Ball} object to stop.
 *
 * Used as the value for the {@link state} variable,
 * if the {@link Ball.simulate} method got stuck in an infinite loop or
 * {@link Ball.velocity} uses an invalid value for one of its components.
 *
 * @type {number}
 */
const STATE_ERROR = -1;

/**
 * Used as the value for the {@link state} variable,
 * if the {@link ball} is currently attached to spring and not being released by the spring.
 *
 * @type {number}
 */
const STATE_SPRING_ATTACHED = 0;

/**
 * Used as the value for the {@link state} variable,
 * if the {@link ball} is currently being released by the spring.
 *
 * @type {number}
 */
const STATE_SPRING_RELEASE = 1;

/**
 * Used as the value for the {@link state} variable,
 * if the {@link ball} has been fully released by the spring and
 * is flying through the air or rolling on the ground.
 *
 * @type {number}
 */
const STATE_THROW = 2;

/**
 * Determines how {@link ball} and spring are being simulated.
 *
 * @type {number}
 */
let state = STATE_SPRING_ATTACHED;

/**
 * @returns {number} How many seconds have passed between the current and the last frame.
 */
function getDeltaInSec() {
    let deltaInSec = deltaTime * 0.001;

    if(deltaInSec > 0.1) {
        return 0;
    } else {
        return deltaInSec;
    }
}

/**
 * Updates the {@link gravityMultiplier}, according to the {@link gravitySlider}'s indicator value.
 *
 * Sets the {@link gravityMultiplier} between 0.25 and 4.
 */
function updateGravity() {
    if(gravitySlider.indicatorValue <= 0.5) {
        gravityMultiplier = 0.25 + gravitySlider.indicatorValue * 3/2;
    } else {
        gravityMultiplier = 1 + (gravitySlider.indicatorValue - 0.5) * 6;
    }

    gravity = STANDARD_GRAVITY * gravityMultiplier;
}

/**
 * Updates how many kg/m³ dense the air is, according to the {@link airDensitySlider}'s indicator value.
 *
 * Sets the {@link airDensity} between 0.0003 kg/m³ and 3 kg/m³.
 */
function updateAirDensity() {
    let newAirDensity;

    if(airDensitySlider.indicatorValue <= 0.5) {
        newAirDensity = 0.1 + airDensitySlider.indicatorValue * 2.4;
    } else {
        newAirDensity = 1.3 + (airDensitySlider.indicatorValue - 0.5) * 1997.4;
    }

    if(newAirDensity !== airDensity) {
        airDensity = newAirDensity;
        ball.recalculateDM();
    }
}

/**
 * Updates how many meters long the {@link ball}'s diameter is, according to the {@link diameterSlider}'s indicator
 * value.
 *
 * The diameter can be between 0.1 m and 0.3 m.
 */
function updateBallDiameter() {
    let newBallDiameter = 0.1 + diameterSlider.indicatorValue * 0.2;

    if(newBallDiameter !== ball.body.diameter) {
        ball.body.diameter = newBallDiameter;
        ball.recalculateDM();
    }
}

/**
 * Updates how many kilograms heavy the {@link ball} is, according to the {@link massSlider}'s indicator value.
 *
 * The mass can be between 0.01 kg and 10 kg.
 */
function updateBallMass() {
    let newBallMass;

    if(massSlider.indicatorValue <= 0.5) {
        newBallMass = 0.01 + massSlider.indicatorValue * 0.98;
    } else {
        newBallMass = 0.5 + (massSlider.indicatorValue - 0.5) * 19;
    }

    if(newBallMass !== ball.mass) {
        ball.mass = newBallMass;
        ball.recalculateDM();
    }
}

/**
 * Updates how high the {@link ball}'s roll resistance coefficient is,
 * according to the {@link rollResistanceSlider}'s indicator value.
 *
 * The roll resistance coefficient can be between 0.0003 and 3.
 */
function updateBallRollResistanceCoefficient() {
    ball.rollResistanceCoefficient = 0.0003 + rollResistanceSlider.indicatorValue * 0.2997;
}

/**
 * Sets a random value for the horizontal {@link windVelocity} between 6 m/s and 9 m/s.
 *
 * The wind can come from the left or the right.
 */
function randomizeWind() {
    windVelocity = createVector(random(0, 1), random(0, 0));
    windVelocity.setMag(random(-9, 6));
}

/**
 * Initializes the {@link ball} object.
 */
function initializeBall() {
    let ballPos = createVector(catapultPosition.x, catapultPosition.y - SPRING_RELAXED_LENGTH);
    let ballBody = new Circle(ballPos, 0.20, CL_GRN);
    ball = new Ball(ballBody, 0.50, 0.05);
}

/**
 * Sets the {@link ball} back to its initial state at the {@link catapult}.
 */
function resetBall() {
    ball.body.position.x = catapultPosition.x;
    ball.body.position.y = catapultPosition.y - SPRING_RELAXED_LENGTH;
    ball.velocity = createVector(0, 0);
    ball.groundSegment = null;
    springVector = createVector(0, -SPRING_RELAXED_LENGTH);
}

/**
 * Attaches the {@link ball} to the mouse cursor, if the {@link ball} is being pressed by the mouse cursor,
 * and the {@link ball} is attached to the spring.
 */
function checkBallPressed() {
    if(state === STATE_SPRING_ATTACHED || state === STATE_SPRING_RELEASE) {
        let mouseCX = transformPxToCx(mouseX);
        let mouseCY = transformPyToCy(mouseY);
        let balMouVec = createVector(mouseCX - ball.body.position.x, mouseCY - ball.body.position.y);

        if(balMouVec.mag() <= ball.body.diameter / 2) {
            ballPressed = true;
            ball.velocity = createVector(0, 0);
        }
    }
}

/**
 * Releases the {@link ball} from the mouse cursor if the {@link ball} is being held by the mouse cursor.
 * Starts to release the ball from the spring if the spring has been stretched to a length longer than its relaxed
 * length.
 *
 * @see SPRING_RELAXED_LENGTH
 */
function checkBallReleasedByMouse() {
    if((state === STATE_SPRING_ATTACHED || state === STATE_SPRING_RELEASE) && ballPressed) {
        ballPressed = false;

        if(springVector.mag() > SPRING_RELAXED_LENGTH + 0.01) {
            state = STATE_SPRING_RELEASE;
        } else {
            state = STATE_SPRING_ATTACHED;
        }
    }
}

/**
 * Releases the {@link ball} from the spring into the air if
 * the spring reaches a length shorter than its relaxed length.
 *
 * Stores additional information about where the {@link ball} is released into the air, which is used by the function
 * {@link simulatePhysics} to determine when to activate the {@link catapultTerrain}.
 *
 * @see SPRING_RELAXED_LENGTH
 */
function checkBallReleasedBySpring() {
    if(springVector.mag() < SPRING_RELAXED_LENGTH) {
        tries++;
        state = STATE_THROW;
        ballTopStart = ball.body.getBottomY() > catapultPosition.y;
        ballLeftStart = ball.body.getRightX() < catapultPosition.x - catapultW / 2;
        ballRightStart = ball.body.getLeftX() > catapultPosition.x + catapultW / 2;
    }
}

/**
 * Limits the {@link ball}'s position to places where it does not stretch the spring to lengths going over the
 * spring's maximum length or going under the spring's relaxed length.
 *
 * @see SPRING_MAX_LENGTH
 * @see SPRING_RELAXED_LENGTH
 */
function adjustBallPositionToSpring() {
    // calculate distance between catapult and mouse cursor
    let catMouVec = createVector(transformPxToCx(mouseX), transformPyToCy(mouseY)).sub(catapultPosition);
    let catMouMag = catMouVec.mag();

    // set ball position depending on spring limits
    if(catMouMag > SPRING_MAX_LENGTH) {
        springVector = catMouVec.setMag(SPRING_MAX_LENGTH);
    } else if(catMouMag < SPRING_RELAXED_LENGTH) {
        springVector = catMouVec.setMag(SPRING_RELAXED_LENGTH);
    } else {
        springVector = catMouVec;
    }

    ball.body.position = catapultPosition.copy().add(catMouVec);
    springPhi = atan2(springVector.y, springVector.x);
}

/**
 * Starts a new try for the minigolf game by reattaching the {@link ball} to the spring and
 * randomizing the {@link windVelocity} if the {@link ball} stayed in the hole during the previous try.
 */
function newTry() {
    if(success === true) {
        randomizeWind();
        applyWindToFlag();
        success = false;
    }

    state = STATE_SPRING_ATTACHED;
    resetBall();
    resetTerrain();
}

/**
 * Resets the minigolf game by reattaching the {@link ball} to the spring,
 * randomizing the {@link windVelocity} and resetting the number of {@link tries} and {@link successfulTries}.
 */
function resetGame() {
    state = STATE_SPRING_ATTACHED;
    tries = 0;
    successfulTries = 0;
    success = false;
    resetBall();
    resetTerrain();
    randomizeWind();
    applyWindToFlag();
}

/**
 * Simulates the physics of the {@link flag}, the {@link ball} and the spring according to the
 * simulation's current {@link state}.
 *
 * Activates the {@link catapultTerrain} if the {@link ball} is not in the area of the {@link catapult} anymore,
 * after being released by the spring.
 *
 * @param delta {number} How many seconds passed between the current and the last frame.
 *
 * @see initializeTerrain
 */
function simulatePhysics(delta) {
    updateFPS(delta);
    updateFlag(delta);

    switch (state) {
        case STATE_SPRING_ATTACHED:
            if(ballPressed) {
                adjustBallPositionToSpring();
            } else {
                simulateSpring(delta);
            }
            break;
        case STATE_SPRING_RELEASE:
            if(ballPressed) {
                adjustBallPositionToSpring();
            } else {
                simulateSpring(delta);
                checkBallReleasedBySpring();
            }
            break;
        case STATE_THROW:
            ball.simulate(delta);

            // Start a new try if the ball flies out of the right screen border.
            if(ball.body.position.x > CANVAS_C_W - cX0 + ball.body.getRadius()) {
                newTry();
            }

            // Limit the ball's height to wall's height.
            if(ball.body.getTopY() > wall.y) {
                ball.body.position.y = wall.y - ball.body.getRadius();
            }

            // Add the catapult terrain when the ball is outside the catapult's area.
            if(!catapultTerrainAdded && (
                (!ballTopStart && ball.body.getBottomY() > catapultPosition.y) ||
                (!ballLeftStart && ball.body.getRightX() < catapultPosition.x - catapultW / 2) ||
                (!ballRightStart && ball.body.getLeftX() > catapultPosition.x + catapultW / 2)
            )) {
                terrainArray.push(catapultTerrain);
                catapultTerrainAdded = true;
            }

            // Check if the ball landed in the hole.
            if(
                !success &&
                ball.collisionSegment != null &&
                ball.collisionSegment.endPoint.y === btmGround.y &&
                ball.body.position.y + ball.velocity.y < 0.10
            ) {
                successfulTries++;
                success = true;
            }

            break;
    }
}