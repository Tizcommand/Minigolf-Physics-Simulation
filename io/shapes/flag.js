/**
 * Stores data about the game's flag and provides functions for initializing its dependencies and simulating its
 * reaction to wind.
 */
let flagpole;
let flag;
let flagOrigin;
let flagAngle = 0;
let flagSway = 0;
let flagSwayMax = 0;
let flagSwayChange = 0;
let flagStretch = 0;

/**
 * Initializes the flag's origin and pole.
 */
function initializeFlag() {
    flagpole = new Rectangle(2.00, 1.25, 0.05, 1.25, fgCl);
    flagOrigin = createVector(2.025, 1);
}

/**
 * Simulates the flag swaying in the wind.
 *
 * @param delta How many seconds passed between the current and the last frame.
 */
function updateFlag(delta) {
    let flagDirectionVec = createVector(0.88, 0);
    flagSway += flagSwayChange * sign(random(1, -1), 0) * delta;
    flagSway = Math.max(-flagSwayMax, flagSway);
    flagSway = Math.min(flagSwayMax, flagSway);
    flagDirectionVec.rotate(flagAngle + flagSway);

    if(windVelocity.x > 8.5 || windVelocity.x < -8.5) {
        flagStretch += flagSwayChange * sign(random(1, -1), 0) * delta;
        flagStretch = Math.max(-flagSwayMax, flagStretch);
        flagStretch = Math.min(flagSwayMax, flagStretch);
    }

    flag = new Triangle(
        flagOrigin.x, flagOrigin.y + 0.12,
        flagOrigin.x, flagOrigin.y - 0.12,
        flagOrigin.x + flagDirectionVec.x + p5.Vector.mult(flagDirectionVec, flagStretch).x,
        flagOrigin.y + flagDirectionVec.y + p5.Vector.mult(flagDirectionVec, flagStretch).y,
        CL_YLW
    );
}

/**
 * Updates data used by the updateFlag function, using the wind's current speed and direction.
 *
 * @see updateFlag
 */
function applyWindToFlag() {
    if(windVelocity.x > 8.5) {
        flagAngle = 0;
        flagSwayChange = 10 * windVelocity.x / 25;
        flagSwayMax = 0.025;
    } else if(windVelocity.x >= 0 && windVelocity.x <= 8.5) {
        flagAngle = Math.max(-(Math.PI / 2) + (windVelocity.x / 8.5 * (Math.PI / 2)), 0.9 * -(Math.PI / 2));
        flagSwayChange = windVelocity.x / 8.5;
        flagSwayMax = 0.125 - 0.1 * (windVelocity.x / 8.5);
        flagStretch = 0;
    } else if(windVelocity.x < 0 && windVelocity.x >= -8.5) {
        flagAngle = Math.min(-(Math.PI / 2) + (windVelocity.x / 8.5 * (Math.PI / 2)), 1.1 * -(Math.PI / 2));
        flagSwayChange = -1 * (windVelocity.x / 8.5);
        flagSwayMax = 0.125 + 0.1 * (windVelocity.x / 8.5);
        flagStretch = 0;
    } else {
        flagAngle = Math.PI;
        flagSwayChange = -10 * windVelocity.x / 25;
        flagSwayMax = 0.025;
    }
}