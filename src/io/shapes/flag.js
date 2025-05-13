/**
 * Stores data about the game's {@link flag} and provides functions for initializing its dependencies and
 * simulating its reaction to wind.
 *
 * @author Tizian Kirchner
 */

/**
 * Stores the visualization of the flag at the minigolf hole as a {@link Triangle}.
 * @type {Triangle}
 */
let flag;

/**
 * Stores the origin of the {@link flag} as a xy {@link Vector}.
 * @type {Vector}
 */
let flagOrigin;

/**
 * Stores the angle at which the {@link flag} is turned through the wind.
 * @type {number}
 */
let flagAngle = 0;

/**
 * Stores how much the {@link flag} is being swayed through the wind.
 *
 * This value is added to the {@link flagAngle} to determine the angle at which the flag is turned.
 * In contrast to the {@link flagAngle}, which does not change unless the {@link windVelocity} changes,
 * this value goes through small random changes.
 * How rapid these changes are, is determined by the {@link flagSwayChange}.
 *
 * @type {number}
 */
let flagSway = 0;

/**
 * Determines the maximum absolute value of the {@link flagSway} variable.
 * @type {number}
 */
let flagSwayMax = 0;

/**
 * Determines how rapidly the {@link flagSway} variable changes.
 *
 * The higher the {@link windVelocity}'s x component is, the higher this variable's value is.
 *
 * @type {number}
 */
let flagSwayChange = 0;

/**
 * Determines how much the {@link flag} is stretched through the wind.
 * @type {number}
 */
let flagStretch = 0;

/**
 * Stores the visualization of the {@link flag}'s flagpole.
 * @type {Rectangle}
 */
let flagpole;

/**
 * Initializes the {@link flagOrigin} and {@link flagpole}.
 */
function initializeFlag() {
    flagOrigin = createVector(2.025, 1);
    flagpole = new Rectangle(2.00, 1.25, 0.05, 1.25, fgCl);
}

/**
 * Simulates the {@link flag} swaying in the wind.
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
 * Updates variables, used by the {@link updateFlag} function, by using the {@link windVelocity}.
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