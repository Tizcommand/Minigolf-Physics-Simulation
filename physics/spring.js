/**
 * Stores information about the spring the ball is attached to at the start of the game.
 *
 * Provides functions for initializing and simulating the spring.
 */
const SPRING_CONSTANT = 50;
const SPRING_RM = 0.80;
const SPRING_RELAXED_LENGTH = 0.25;
const SPRING_MAX_LENGTH = 1;
let springPhi;
let springVector;

/**
 * Initializes the spring the ball is attached to at the start of the game.
 */
function initializeSpring() {
    springVector = createVector(0, -SPRING_RELAXED_LENGTH);
    springPhi = atan2(springVector.y, springVector.x);
}

/**
 * Simulates how the spring pulls on the ball and changes its properties accordingly.
 *
 * @param delta For how many seconds to simulate the spring.
 */
function simulateSpring(delta) {
    let springLength = springVector.mag();
    let springForce = 0;

    if(springLength > SPRING_RELAXED_LENGTH) {
        springForce = (springLength - SPRING_RELAXED_LENGTH) * SPRING_CONSTANT;
    }

    let balXAcc = SPRING_RM * ball.velocity.x + springForce * cos(springPhi) / ball.mass;
    let balYAcc = gravity + SPRING_RM * ball.velocity.y + springForce * sin(springPhi) / ball.mass;
    balXAcc *= delta;
    balYAcc *= delta;

    ball.velocity.x -= balXAcc;
    ball.velocity.y -= balYAcc;

    ball.body.position.add(p5.Vector.mult(ball.velocity, delta));

    springVector = p5.Vector.sub(ball.body.position, catapultPosition);
    springPhi = atan2(springVector.y, springVector.x);
}