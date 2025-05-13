/**
 * Provides functions for testing how the {@link ball} moves and reacts to collisions under different conditions.
 *
 * @author Tizian Kirchner
 */

/**
 * Rolls the {@link ball} off the right corner of the hole.
 */
function testRightCornerFall() {
    ball.body.position = createVector(rgtGround.x + 1, ball.body.getRadius() + 0.01);
    ball.velocity = createVector(-1.5, 0);
    windVelocity = createVector(0, 0);
    state = STATE_THROW;
}

/**
 * Rolls the {@link ball} off the left corner of the hole.
 */
function testLeftCornerFall() {
    ball.body.position = createVector(lftGround.x + lftGround.w - 1, ball.body.getRadius() + 0.01);
    ball.velocity = createVector(1.5, 0);
    windVelocity = createVector(0, 0);
    state = STATE_THROW;
}

/**
 * Lets the {@link ball} fall on the right corner of the hole.
 */
function testRightCornerCollision() {
    ball.body.position = createVector(rgtGround.x, ball.body.getRadius() + 5);
    ball.velocity = createVector(0, 0);
    windVelocity = createVector(0, 0);
    state = STATE_THROW;
}

/**
 * Lets the {@link ball} fall on the left corner of the hole.
 */
function testLeftCornerCollision() {
    ball.body.position = createVector(lftGround.x + lftGround.w, ball.body.getRadius() + 5);
    ball.velocity = createVector(0, 0);
    windVelocity = createVector(0, 0);
    state = STATE_THROW;
}

/**
 * Lets the {@link ball} get pressed against the {@link obstacleTerrain} by the wind,
 * while keeping the {@link ball} on the ground.
 */
function testStrongWindGroundCollision() {
    ball.body.position = createVector(8, ball.body.getRadius() + 0.01);
    ball.velocity = createVector(-10, 0);
    windVelocity = createVector(-10, 0);
    state = STATE_THROW;
}

/**
 * Lets the {@link ball} get pressed against the {@link wallTerrain} on the left,
 * while the {@link ball} is flying midair.
 */
function testStrongWindAirCollision() {
    ball.body.position = createVector(8, ball.body.getRadius() + 10);
    ball.velocity = createVector(-10, 0);
    windVelocity = createVector(-10, 0);
    state = STATE_THROW;
}