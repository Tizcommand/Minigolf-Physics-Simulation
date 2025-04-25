/**
 * Provides functions for printing information about the balls physics interactions.
 */

/**
 * Prints information about a collision to the console.
 *
 * @param collisionSegment {TerrainSegment}
 * The Segment the ball collided with.
 *
 * @param segmentNormal {p5.Vector}
 * The normal of the collision segment.
 *
 * @param collisionDistance {number}
 * How many meters the ball had moved into the terrain.
 *
 * @param delta {number}
 * How many seconds passed between the current and the last frame.
 *
 * @param correctionDelta {number}
 * How many seconds of the balls movement were reversed to move it out of the terrain, if the correction type is
 * "velocity".
 *
 * @param correctionDeltaSum {number}
 * How many seconds of the balls movement will be simulated in this frame, after the has been moved out of the terrain.
 *
 * @param correctionType {String}
 * Contains either the string "Velocity" or "Normal" depending on whether the ball was moved out of the terrain by
 * reversing the balls movement or using the collision segment's normal and the collision distance.
 *
 * @param correctionVector {p5.Vector}
 * The movement vector that was used to move the ball out of the terrain.
 *
 * @see Ball.moveOutOfTerrain
 */
function logCollision(
    collisionSegment, segmentNormal, collisionDistance,
    delta, correctionDelta, correctionDeltaSum,
    correctionType, correctionVector
) {
    console.log(
        "COLLISION:" +
        "\nballVelocity: " + vectorToShortString(ball.velocity) + "㎧" +
        "\ncollision" + collisionSegment + "; terrainSegmentNormal: " + vectorToShortString(segmentNormal) +
        "\ncollisionDistance: " + collisionDistance + "m" +
        "\ndelta: " + delta + "s; correction: " + correctionDelta + "s; sum: " + correctionDeltaSum + "s" +
        "\ncorrectionVector(" + correctionType + "): " + vectorToShortString(correctionVector)
    );
}

/**
 * Prints information about a reflection of the ball, off the terrain, in the air.
 *
 * @param oldVelocity {p5.Vector}
 * The ball's velocity before the reflection.
 *
 * @param collisionObject {TerrainSegment | TerrainCorner}
 * The terrain object the ball was reflected off.
 *
 * @param collisionNormal {p5.Vector}
 * The normal of the collision object.
 *
 * @see Ball.reflectInAir
 */
function logAirReflection(
    oldVelocity, collisionObject, collisionNormal
) {
    console.log(
        "AIR REFLECTION:" +
        "\noldVelocity: " + vectorToShortString(oldVelocity) + " newVelocity: " + vectorToShortString(ball.velocity) +
        "\ncollision" + collisionObject + " collisionNormal: " + vectorToShortString(collisionNormal)
    );
}

/**
 * Prints information about a reflection of the ball, off the terrain, on the ground.
 *
 * @param oldVelocity {p5.Vector}
 * The ball's velocity before the reflection.
 *
 * @param collisionObject {TerrainSegment | TerrainCorner}
 * The terrain object the ball was reflected off.
 *
 * @param groundSegmentDirection {p5.Vector}
 * The vector of the terrain segment the ball is rolling on, going from the segment's rightmost point to its leftmost
 * point.
 *
 * @see Ball.reflectOnGround
 */
function logGroundReflection(
    oldVelocity, collisionObject, groundSegmentDirection
) {
    console.log(
        "GROUND REFLECTION:" +
        "\noldVelocity: " + vectorToShortString(oldVelocity) + " newVelocity: " + vectorToShortString(ball.velocity) +
        "\ncollision" + collisionObject + " groundSegment: " + vectorToShortString(groundSegmentDirection)
    );
}

/**
 * Prints information about the ball falling off a terrain segment.
 *
 * @param oldVelocity
 * The balls velocity before falling off the segment.
 *
 * @param fallSegment
 * The segment the ball has fallen off.
 *
 * @see Ball.fallOffGround
 */
function logFall(oldVelocity, fallSegment) {
    console.log(
        "FALLING:" +
        "\noldVelocity: " + vectorToShortString(oldVelocity) + " newVelocity: " + vectorToShortString(ball.velocity) +
        "\nfall" + fallSegment
    );
}