/**
 * Contains and updates values related to the physics of the environment in which the minigolf game takes place.
 * Performs different physics calculations according to different states the minigolf game can be in, such as the
 * ball being attached to the spring or being released by the spring.
 */

/* physics */

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
 * @type {number}
 * @see Ball.reflectInAir
 */
const BOUNCING_THRESHOLD = 0.1;

let gravity = STANDARD_GRAVITY;
let gravityMultiplier = 1;
let airDensity = 1.3;
let windVelocity;

/* ball */
let ball;
let ballPressed = false;
let ballTopStart = false;
let ballRightStart = false;
let ballLeftStart = false;

/* administration */

/**
 * Determines if collision information is printed to the console and if terrain colliders are drawn.
 *
 * @type {boolean}
 */
const DEBUG = false;

let tries = 0;
let successfulTries = 0;
let success = false;

const STATE_ERROR = -1;
const STATE_SPRING_ATTACHED = 0;
const STATE_SPRING_RELEASE = 1;
const STATE_THROW = 2;
let state = STATE_SPRING_ATTACHED;

/**
 * Returns how many seconds have passed between the current and the last frame.
 *
 * @returns {number} How many seconds have passed between the current and the last frame.
 */
function getDeltaInSec() {
    let deltaInSec = deltaTime * 0.001;

    if(deltaInSec > 1) {
        return 0;
    } else {
        return deltaInSec;
    }
}

/**
 * Updates the multiplier for the environment's gravity, according to the gravity slider's indicator value.
 *
 * The multiplier can be between 0.25 and 4.
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
 * Updates how many kg/m³ dense the air is, according to the air density slider's indicator value.
 *
 * The density can be between 0.0003kg/m³ and 3kg/m³.
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
        ball.dm = ball.getDM();
    }
}

/**
 * Updates how many meters long the ball diameter is, according to the diameter slider's indicator value.
 *
 * The diameter can be between 0.1m and 0.3m.
 */
function updateBallDiameter() {
    let newBallDiameter = 0.1 + diameterSlider.indicatorValue * 0.2;

    if(newBallDiameter !== ball.body.diameter) {
        ball.body.diameter = newBallDiameter;
        ball.dm = ball.getDM();
    }
}

/**
 * Updates how many kilograms heavy the ball is, according to the mass slider's indicator value.
 *
 * The mass can be between 0.01kg and 10kg.
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
        ball.dm = ball.getDM();
    }
}

/**
 * Updates how high the ball's roll resistance coefficient is, according to the roll resistance slider's indicator
 * value.
 *
 * The roll resistance coefficient can be between 0.0003 and 3.
 */
function updateBallRollResistanceCoefficient() {
    ball.rollResistanceCoefficient = 0.0003 + rollResistanceSlider.indicatorValue * 0.2997;
}

/**
 * Sets a random value for the horizontal wind velocity between 6m/s and 9m/s.
 *
 * The wind can come from the left or the right.
 */
function randomizeWind() {
    windVelocity = createVector(random(0, 1), random(0, 0));
    windVelocity.setMag(random(-9, 6));
}

/**
 * Initializes the ball that is used for the minigolf game.
 */
function initializeBall() {
    let ballPos = createVector(catapultPosition.x, catapultPosition.y - SPRING_RELAXED_LENGTH);
    let ballBody = new Circle(ballPos, 0.20, CL_GRN);
    ball = new Ball(ballBody, 0.50, 0.05);
}

/**
 * Sets the ball back to its initial state at the catapult.
 */
function resetBall() {
    ball.body.position.x = catapultPosition.x;
    ball.body.position.y = catapultPosition.y - SPRING_RELAXED_LENGTH;
    ball.velocity = createVector(0, 0);
    ball.groundSegment = null;
    springVector = createVector(0, -SPRING_RELAXED_LENGTH);
}

/**
 * Attaches the ball to the mouse, if the ball is being pressed by the mouse, and the ball is attached to the spring.
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
 * Releases to ball from the mouse if it is being held by the mouse. Starts to release the ball from the
 * spring if the spring has been stretched to a length longer than its relaxed length.
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
 * Releases the ball from the spring into the air if the spring reaches a length shorter than its relaxed length.
 *
 * Stores additional information about where the ball is released into the air, which is used in the function
 * simulatePhysics to determine when to activate the catapult terrain.
 *
 * @see simulatePhysics
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
 * Limits the balls position to places where it does not stretch the spring to lengths going over the spring's max
 * length or going under the spring's relaxed length.
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
 * Starts a new try for the minigolf game by reattaching the ball to the spring and randomizing the wind, if the
 * ball stayed in the hole in the previous try.
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
 * Resets the minigolf game by reattaching the ball to the spring, randomizing the wind and resetting the amount of
 * tries and successful tries.
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
 * Simulates the physics of the flag, the ball and the spring according to the minigolf games current state.
 *
 * Activates the catapult terrain if the ball is not in the area of the catapult anymore, after being released by the
 * spring.
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

            // start new game if ball flies out of the right screen border
            if(ball.body.position.x > CANVAS_C_W - cX0 + ball.body.getRadius()) {
                newTry();
            }

            // limit ball height to wall height
            if(ball.body.getTopY() > wall.y) {
                ball.body.position.y = wall.y - ball.body.getRadius();
            }

            // add catapult terrain when ball is out of catapult area
            if(!catapultTerrainAdded && (
                (!ballTopStart && ball.body.getBottomY() > catapultPosition.y) ||
                (!ballLeftStart && ball.body.getRightX() < catapultPosition.x - catapultW / 2) ||
                (!ballRightStart && ball.body.getLeftX() > catapultPosition.x + catapultW / 2)
            )) {
                terrainArray.push(catapultTerrain);
                catapultTerrainAdded = true;
            }

            // check if ball landed in hole
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