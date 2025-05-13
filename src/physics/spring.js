/**
 * Stores information about the spring the {@link ball} is attached to during the states {@link STATE_SPRING_ATTACHED}
 * and {@link STATE_SPRING_RELEASE}.
 *
 * Provides functions for initializing and simulating the spring.
 *
 * @author Tizian Kirchner
 */

/**
 * Determines how much N/m of force is required to stretch or compress the spring.
 * @type {number}
 */
const SPRING_STIFFNESS = 50;

/**
 * How long the spring is while it is relaxed.
 * @type {number}
 */
const SPRING_RELAXED_LENGTH = 0.25;

/**
 * How far the spring can be stretched by the mouse cursor.
 * @type {number}
 */
const SPRING_MAX_LENGTH = 1;

/**
 * Stores the angle between the {@link springVector} and the positive x-axis in radians.
 * @type {number}
 */
let springPhi;

/**
 * Stores a {@link Vector} going from the tip of the {@link catapult} to the center of the {@link ball}.
 */
let springVector;

/**
 * Initializes the spring the {@link ball} is attached to during the states {@link STATE_SPRING_ATTACHED}
 * and {@link STATE_SPRING_RELEASE}.
 */
function initializeSpring() {
    springVector = createVector(0, -SPRING_RELAXED_LENGTH);
    springPhi = atan2(springVector.y, springVector.x);
}

/**
 * Simulates how the spring pulls on the {@link ball}.
 *
 * Changes the {@link ball}'s properties accordingly.
 *
 * @param delta For how many seconds to simulate the spring.
 */
function simulateSpring(delta) {
    let springLength = springVector.mag();
    let springForce = 0;

    if(springLength > SPRING_RELAXED_LENGTH) {
        springForce = (springLength - SPRING_RELAXED_LENGTH) * SPRING_STIFFNESS;
    }

    let ballRM = ball.body.getRadius() / ball.mass;
    let ballXAcc = ballRM * ball.velocity.x + springForce * cos(springPhi) / ball.mass;
    let ballYAcc = gravity + ballRM * ball.velocity.y + springForce * sin(springPhi) / ball.mass;
    ballXAcc *= delta;
    ballYAcc *= delta;

    ball.velocity.x -= ballXAcc;
    ball.velocity.y -= ballYAcc;

    ball.body.position.add(p5.Vector.mult(ball.velocity, delta));

    springVector = p5.Vector.sub(ball.body.position, catapultPosition);
    springPhi = atan2(springVector.y, springVector.x);
}