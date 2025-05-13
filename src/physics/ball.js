/**
 * {@link Circle} which can bounce off terrain, roll on the ground, and react to wind.
 *
 * @author Tizian Kirchner
 */
class Ball {
    /* constructor dependent fields */

    /**
     * The {@link Circle} which makes up this {@link Ball}'s body.
     *
     * @type {Circle}
     */
    body = null;

    /**
     * Higher mass means this {@link Ball} is less affected by the spring and the wind,
     * but more affected by {@link gravity}.
     *
     * @type {number}
     */
    mass = 0;

    /**
     * The higher this coefficient, the faster this {@link Ball} comes to a stop when rolling on the ground.
     *
     * @type {number}
     */
    rollResistanceCoefficient = 0;

    /**
     * This {@link Ball}'s drag divided by its mass. This value is used to calculate by how many m/s this ball is
     * speeded up by the air.
     *
     * @type {number}
     */
    dm = 0;

    /* ground-related fields */

    /**
     * The {@link TerrainSegment} on which this {@link Ball} is rolling.
     *
     * If this field is set to null, this {@link Ball} is currently flying in the air.
     *
     * @type {TerrainSegment}
     */
    groundSegment = null;

    /**
     * The {@link TerrainPolygon} to which the {@link groundSegment} belongs.
     *
     * If this field is set to null, this {@link Ball} is currently flying in the air.
     *
     * @type {TerrainPolygon}
     */
    groundTerrain = null;

    /* velocity-related fields */

    /**
     * Determines how fast this {@link Ball} is moving in which direction.
     *
     * @type {p5.Vector}
     */
    velocity = createVector(0, 0);

    /**
     * Determines how much this {@link Ball} is being speeded up through the air and {@link gravity}.
     *
     * @type {p5.Vector}
     */
    airAcceleration = createVector(0, 0);

    /**
     * Determines how much this {@link Ball} is being speeded up through the {@link groundSegment} it is rolling on.
     *
     * @type {p5.Vector}
     */
    segmentAcceleration = createVector(0, 0);

    /* collision-related fields */

    /**
     * Determines if this {@link Ball} is currently colling with something.
     *
     * @type {boolean}
     */
    collision = false;

    /**
     * Determines if this {@link Ball} needs to be reflected off terrain.
     *
     * @type {boolean}
     */
    collided = false;

    /**
     * The {@link TerrainPolygon} to which the {@link collisionSegment} belongs.
     *
     * If this field is set to null, this {@link Ball} is not colliding with anything.
     *
     * @type {TerrainPolygon}
     */
    collisionTerrain = null;

    /**
     * The {@link TerrainSegment} this {@link Ball} is currently colliding with.
     *
     * If this field is set to null, this {@link Ball} is not colliding with anything.
     *
     * @type {TerrainSegment}
     */
    collisionSegment = null;

    /**
     * The normal of the {@link collisionSegment} this {@link Ball} is currently colliding with.
     *
     * If this field is set to null, this {@link Ball} is not colliding with anything.
     *
     * @type {p5.Vector}
     */
    collisionSegmentNormal = null;

    /**
     * Determines by how many seconds this {@link Ball}'s movement needs to be corrected.
     *
     * @type {number}
     */
    correctionDeltaSum = 0;

    /**
     * Determines how often the loop of the {@link simulate} method has been executed.
     *
     * @type {number}
     */
    loopCounter = 0;

    /**
     * Determines how many meters this {@link Ball} has moved into the terrain object it collided with the last time the
     * {@link moveOutOfTerrain} method was called.
     *
     * @type {number}
     */
    oldCollisionDistance = Infinity;

    /**
     * Returns a new {@link Ball} object.
     *
     * @param body {Circle}
     * See {@link Ball.body}.
     *
     * @param mass {number}
     * See {@link Ball.mass}.
     *
     * @param rollResistanceCoefficient {number}
     * See {@link Ball.rollResistanceCoefficient}.
     */
    constructor(body, mass, rollResistanceCoefficient) {
        this.body = body;
        this.mass = mass;
        this.rollResistanceCoefficient = rollResistanceCoefficient;
        this.recalculateDM();
    }

    /**
     * Bounces this {@link Ball} off terrain, rolls it on the ground, and affects it through wind.
     *
     * @param delta {number}
     * For how many seconds to simulate this {@link Ball}.
     */
    simulate(delta) {
        this.addAcceleration(delta);
        this.resetCollisionInformation();

        do {
            // Check if an error occurred.
            if(
                isNaN(this.velocity.x) || isNaN(this.velocity.y) ||
                this.velocity.x === Infinity || this.velocity.y === Infinity ||
                this.loopCounter >= 100
            ) {
                state = STATE_ERROR;
                return;
            }

            // Check if this Ball collided with something.
            let collisionInfo = this.getTerrainArrayCollisionInfo();

            if (collisionInfo.collisionDistance !== 0) {
                this.moveOutOfTerrain(collisionInfo, delta);
            } else {
                if (this.collided) { // Check if this Ball should be reflected.
                    // Check if this Ball collided with a corner or a segment.
                    let collisionObjectAndNormal = this.getCollisionObjectAndNormal();
                    let collisionObject = collisionObjectAndNormal.collisionObject;
                    let collisionNormal = collisionObjectAndNormal.collisionNormal;

                    if (this.groundSegment == null) { // Check if this Ball should be reflected in the air.
                        let oldVelocity = this.velocity.copy();
                        this.reflectInAir(collisionObject, collisionNormal, delta);
                        if(DEBUG) logAirReflection(oldVelocity, collisionObject, collisionNormal);
                    } else { // Reflect this Ball on the ground.
                        let oldVelocity = this.velocity.copy();
                        let groundSegmentDir = this.groundSegment.direction;
                        this.reflectOnGround(collisionObject, this.segmentAcceleration, delta);
                        if(DEBUG) logGroundReflection(oldVelocity, collisionObject, groundSegmentDir);
                    }

                    this.collided = false;
                    delta = this.correctionDeltaSum;
                } else {
                    if(this.isOffGround()) { // Check if this Ball should fall off the ground.
                        let oldVelocity = this.velocity.copy();
                        let fallSegment = this.groundSegment;
                        delta = this.fallOffGround(delta);
                        if(DEBUG) logFall(oldVelocity, fallSegment);
                    }

                    this.collision = false;
                }

                this.correctionDeltaSum = 0;
            }

            this.loopCounter++;
        } while (this.collision);

        if(DEBUG) console.log("______________________");
    }

    /**
     * Resets all collision-related fields stored by this {@link Ball}.
     */
    resetCollisionInformation() {
        this.collision = false;
        this.collided = false;

        this.collisionTerrain = null;
        this.collisionSegment = null;
        this.collisionSegmentNormal = null;

        this.correctionDeltaSum = 0;
        this.loopCounter = 0;
        this.oldCollisionDistance = Infinity;
    }

    /**
     * Speeds up this {@link Ball}.
     *
     * Depending on whether this {@link Ball} is in the air or on the ground, it will be speeded up differently.
     *
     * @param delta {number}
     * For how many seconds to speed up this {@link Ball}.
     */
    addAcceleration(delta) {
        this.airAcceleration = this.getAirAcceleration(delta);
        this.segmentAcceleration = createVector(0, 0);

        if(this.groundSegment == null) {
            this.velocity.add(this.airAcceleration);
        } else {
            this.segmentAcceleration = this.getSegmentAcceleration(this.airAcceleration.x, delta);
            this.velocity.add(this.segmentAcceleration);

            if(this.segmentAcceleration.mag() === 0) {
                this.velocity = this.segmentAcceleration;
            }
        }

        let ballMovement = p5.Vector.mult(this.velocity, delta);
        this.body.position.add(ballMovement);
    }

    /**
     * Moves this {@link Ball} out of the terrain it collided with and
     * stores various information about the collision that occurred.
     *
     * @param collisionInfo {{
     *  collisionTerrain: TerrainPolygon, collisionSegment: TerrainSegment, collisionSegmentNormal: p5.Vector,
     *  collisionDistance: number, correctionDelta: number
     * }}
     * Various information about a collision.
     *
     * The collision terrain is the {@link TerrainPolygon} this ball is colling with.
     *
     * The collision segment is the {@link TerrainSegment} of the collisionTerrain this {@link Ball} is colliding with.
     *
     * The collision segment normal is the normal of the collisionSegment this {@link Ball} is colliding with.
     *
     * The collision distance describes how many meters this ball has moved into the collisionTerrain.
     *
     * The correction delta describes how many seconds of time have to be reversed to undo the collision.
     *
     * @param delta
     * For how many seconds the current iteration of the {@link simulate} method's loop
     * is simulating this {@link Ball}.
     */
    moveOutOfTerrain(collisionInfo, delta) {
        // Store collision information.
        this.collision = true;
        this.collided = true;

        this.collisionTerrain = collisionInfo.collisionTerrain;
        this.collisionSegment = collisionInfo.collisionSegment;
        this.collisionSegmentNormal = collisionInfo.collisionSegmentNormal;

        let collisionDistance = collisionInfo.collisionDistance;
        let correctionDelta = collisionInfo.correctionDelta;

        if(correctionDelta > delta) {
            correctionDelta = delta;
        }

        this.correctionDeltaSum += correctionDelta;

        if(this.correctionDeltaSum > delta) {
            this.correctionDeltaSum = delta;
        }

        // Correct this Ball's position.
        let correctionVector;
        let correctionType;

        if(
            (this.groundSegment != null && this.collisionSegment === this.groundSegment) ||
            this.oldCollisionDistance < collisionDistance
        ) {
            // Fallback that is used if this Ball was pushed further into the terrain, the last time this method was
            // called. Uses the collision segment's normal and the collision distance to correct the ball's position.
            correctionVector = p5.Vector.mult(this.collisionSegment.normal, collisionDistance);
            correctionType = "Normal";
        } else {
            // Default correction procedure. Reverses some of this Ball's movement.
            correctionVector = p5.Vector.mult(this.velocity, -correctionDelta);
            correctionType = "Velocity";
        }

        this.body.position.add(correctionVector);
        this.oldCollisionDistance = collisionDistance;

        if(DEBUG) logCollision(
            this.collisionSegment, this.collisionSegmentNormal, collisionDistance,
            delta, correctionDelta, this.correctionDeltaSum,
            correctionType, correctionVector
        );
    }

    /**
     * Reflects this {@link Ball} off terrain while it is in the air.
     *
     * Starts to let this {@link Ball} rolling on the ground if it collided with a {@link TerrainSegment},
     * and this {@link Ball}'s {@link velocity} after the reflection, along the {@link TerrainSegment}'s normal,
     * is smaller than the {@link BOUNCING_THRESHOLD} constant.
     * The collision segment's normal must be at least slightly pointing upwards for this {@link Ball} to start rolling.
     *
     * @param {TerrainSegment | TerrainCorner} collisionObject
     * The terrain object this ball collided with.
     *
     * @param {p5.Vector} collisionNormal
     * The normal of the collisionObject.
     *
     * @param {number} delta
     * For how many seconds the current iteration of the {@link simulate} method's loop
     * is simulating this {@link Ball}.
     *
     * @see BOUNCING_THERSHOLD
     */
    reflectInAir(collisionObject, collisionNormal, delta) {
        // Subtract approximate superfluous air acceleration.
        this.velocity.sub(this.airAcceleration.copy().mult(this.correctionDeltaSum / delta));

        // Check if this Ball is still moving.
        let ballNormalVelocity = 0;

        if(this.velocity.mag() > 0) {
            // Reflect this Ball.
            let normalVelocityAngle = collisionNormal.angleBetween(this.velocity);
            this.velocity.rotate(-normalVelocityAngle * 2);
            this.velocity.mult(-1);

            // Decrease this Ball's velocity along the collisionObject's normal by 20%.
            let normalAngle = atan2(collisionNormal.y, collisionNormal.x);
            let velocityAngle = atan2(this.velocity.y, this.velocity.x);
            ballNormalVelocity = this.velocity.mag() * cos(normalAngle - velocityAngle);
            this.velocity.sub(p5.Vector.mult(collisionNormal, ballNormalVelocity * 0.2));

            // Check if this Ball starts rolling.
            velocityAngle = atan2(this.velocity.y, this.velocity.x);
            ballNormalVelocity = this.velocity.mag() * cos(normalAngle - velocityAngle);
        }

        if (
            ballNormalVelocity < BOUNCING_THRESHOLD &&
            collisionObject.type === TERRAIN_SEGMENT &&
            collisionObject.direction.x < 0
        ) {
            // Set this Ball to start rolling.
            this.groundTerrain = this.collisionTerrain;
            this.groundSegment = collisionObject;
            let segmentAcc = createVector(0, 0);
            this.reflectOnGround(collisionObject, segmentAcc, delta);
        } else {
            // Add corrected air acceleration.
            this.airAcceleration = this.getAirAcceleration(this.correctionDeltaSum);
            let segmentVertical = collisionObject.type === TERRAIN_SEGMENT && collisionObject.direction.x === 0;
            this.addReflectionAcceleration(this.airAcceleration, segmentVertical);

            // Position this Ball.
            this.body.position.add(p5.Vector.mult(this.velocity, this.correctionDeltaSum));
        }
    }

    /**
     * Reflects this {@link Ball} off terrain while it is rolling on the ground.
     *
     * @param {TerrainSegment | TerrainCorner} collisionObject
     * The object this {@link Ball} collided with.
     *
     * @param {p5.Vector} segmentAcc
     * How much this {@link Ball} was speeded up horizontally and vertically between the current and the last frame.
     *
     * @param {number} delta
     * For how many seconds the current iteration of the {@link simulate} method's loop
     * is simulating this {@link Ball}.
     */
    reflectOnGround(collisionObject, segmentAcc, delta) {
        // subtract approximate superfluous segment acceleration
        this.velocity.sub(segmentAcc.mult(this.correctionDeltaSum / delta));

        // reflect ball
        let collisionSegmentSgn;

        if(collisionObject.type === TERRAIN_SEGMENT) {
            collisionSegmentSgn = sign(collisionObject.direction.x, 0);
        } else {
            collisionSegmentSgn = 0;
        }

        if(collisionSegmentSgn !== 0) {
            let velocitySgn = 1;

            if (sign(this.velocity.x, 0) !== collisionSegmentSgn) {
                velocitySgn = -1;
            }

            let oldVelocity = abs(this.velocity.x);
            this.groundTerrain = this.collisionTerrain;
            this.groundSegment = collisionObject;
            this.velocity = p5.Vector.mult(this.groundSegment.direction, velocitySgn);
            this.velocity.setMag(oldVelocity);
        } else {
            this.velocity.mult(-1);
        }

        // add segment acceleration
        let airAcc = this.getAirAcceleration(this.correctionDeltaSum);
        segmentAcc = this.getSegmentAcceleration(airAcc.x, this.correctionDeltaSum);

        if(segmentAcc.mag() < this.velocity.mag()) {
            this.velocity.add(segmentAcc);
        } else {
            this.velocity = createVector(0, 0)
        }

        // position ball
        this.body.position.add(p5.Vector.mult(this.velocity, this.correctionDeltaSum));
    }

    /**
     * @returns {boolean} If this {@link Ball} has left the ground.
     */
    isOffGround() {
        if (this.groundSegment != null) {
            let corners = this.groundTerrain.corners;
            let testNormal = p5.Vector.mult(this.groundSegment.normal, COLLISION_THRESHOLD);
            let testPosition = this.body.position.copy().sub(testNormal);
            let segmentCollisionDistance = this.getSegmentCollisionDistance(this.groundSegment, testPosition);
            let cornerOverwrite = false;

            if(segmentCollisionDistance > 0) for(let i = 0; i < corners.length; i++) {
                let cornerBallCenterDistance = p5.Vector.sub(this.body.position, corners[i].position).mag();
                cornerOverwrite = this.getCornerOverwrite(corners[i], cornerBallCenterDistance);

                if(cornerOverwrite) {
                    i = corners.length;
                }
            }

            return (cornerOverwrite || segmentCollisionDistance === 0);
        }

        return false;
    }

    /**
     * If the ball rolled over the corner of a ledge, it is put onto the ledge and then let to fall off that corner.
     *
     * @param {number} delta
     * For how many seconds the current iteration of the {@link simulate} method's loop
     * is simulating this {@link Ball}.
     *
     * @returns {number}
     * How many seconds passed between this ball arriving at the top of the ledge's corner and the start time from which
     * the current iteration of the {@link simulate} method's loop is simulating this {@link Ball}.
     */
    fallOffGround(delta) {
        // calculate ball segment horizontal distance
        let segmentHorizontalDistance = 0;

        if (this.body.position.x > this.groundSegment.startPoint.x) {
            segmentHorizontalDistance = this.body.position.x - this.groundSegment.startPoint.x;
        } else if (this.body.position.x < this.groundSegment.endPoint.x) {
            segmentHorizontalDistance = this.groundSegment.endPoint.x - this.body.position.x;
        }

        // check if ball position needs to be corrected
        let ballMovementDistance = p5.Vector.mult(this.velocity, delta).mag();
        let correctionDelta = 0;

        if(ballMovementDistance > 0) {
            // calculate correction delta
            correctionDelta = segmentHorizontalDistance / ballMovementDistance * delta;

            // put the ball on the corner
            let correctionVector = p5.Vector.mult(this.velocity, correctionDelta);
            this.body.position.sub(correctionVector);

            // subtract approximate superfluous segment acceleration
            this.velocity.sub(this.segmentAcceleration.copy().mult(correctionDelta / delta));

            // add air acceleration
            let airAcc = this.getAirAcceleration(correctionDelta);
            this.addReflectionAcceleration(airAcc, this.groundSegment.direction.x === 0);

            // correct ball position
            this.body.position.add(p5.Vector.mult(this.velocity, correctionDelta));
        }

        this.groundSegment = null;
        return correctionDelta;
    }

    /**
     * Speeds up this {@link Ball} after it was reflected off terrain.
     *
     * If this {@link Ball}'s horizontal/vertical {@link velocity} is smaller
     * than the horizontal/vertical reflectionAcceleration,
     * this {@link Ball} will not be speeded up horizontally/vertically
     * to prevent this {@link Ball} from getting stuck in the terrain
     * trough floating point rounding errors.
     *
     * @param {p5.Vector} reflectionAcceleration
     * How much this {@link Ball} is speeded up horizontally and vertically.
     *
     * @param {boolean} segmentVertical
     * If this {@link Ball} is reflected through a completely vertical {@link TerrainSegment}.
     * Allows vertical acceleration to be added even if this {@link Ball}'s vertical {@link velocity} is smaller
     * than the vertical reflectionAcceleration.
     */
    addReflectionAcceleration(reflectionAcceleration, segmentVertical) {
        let xOk = abs(reflectionAcceleration.x) < abs(this.velocity.x);
        let yOk = abs(reflectionAcceleration.y) < abs(this.velocity.y);

        if(xOk && yOk) {
            this.velocity.add(reflectionAcceleration);
        } else if(yOk || segmentVertical) {
            this.velocity.x = 0;
            this.velocity.y += reflectionAcceleration.y;
        } else if(xOk) {
            this.velocity.x += reflectionAcceleration.x;
            this.velocity.y = 0;
        }
    }

    /**
     * Determines if this {@link Ball} has collided with a {@link TerrainSegment} or {@link TerrainCorner} and
     * returns the corresponding object, and its normal.
     *
     * @returns {{collisionObject: TerrainSegment | TerrainCorner, collisionNormal: Vector}}
     * The collisionObject, either a {@link TerrainSegment} or {@link TerrainCorner},
     * and the normal of the collisionObject.
     */
    getCollisionObjectAndNormal() {
        let collisionCorner = null;
        let collisionCornerNormal = null;

        this.collisionTerrain.corners.forEach(corner => {
            let cornerBallCenterDistance = p5.Vector.sub(this.body.position, corner.position).mag();
            let cornerOverwrite = this.getCornerOverwrite(corner, cornerBallCenterDistance);

            if(cornerOverwrite) {
                collisionCorner = corner;
                collisionCornerNormal = p5.Vector.sub(this.body.position, corner.position).normalize();
            }
        })

        let collisionObject;
        let collisionNormal;

        if(collisionCorner != null) {
            collisionObject = collisionCorner;
            collisionNormal = collisionCornerNormal;
        } else {
            collisionObject = this.collisionSegment;
            collisionNormal = this.collisionSegmentNormal;
        }

        return {
            'collisionObject': collisionObject,
            'collisionNormal': collisionNormal
        }
    }

    /**
     * Detects if this {@link Ball} is colliding with one of the {@link TerrainPolygon}s in the {@link terrainArray} and
     * returns various information about the collision if a collision occurred.
     *
     * @returns {{
     *  collisionTerrain: TerrainPolygon, collisionSegment: TerrainSegment, collisionSegmentNormal: p5.Vector,
     *  collisionDistance: number, correctionDelta: number
     * }}
     * Various information about a collision.
     *
     * The collisionTerrain is the {@link TerrainPolygon} this {@link Ball} is colling with.
     *
     * The collision segment is the {@link TerrainSegment} of the collisionTerrain
     * this {@link Ball} is colliding with.
     *
     * The collisionSegmentNormal is the normal of the {@link TerrainSegment} this {@link Ball} is colliding with.
     *
     * The collisionDistance describes how many meters this {@link Ball} has moved into the {@link TerrainPolygon}.
     *
     * The correctionDelta describes how many seconds have to be reversed to undo the collision.
     *
     * If no collision occurred, collisionTerrain, collisionSegment, and collisionSegmentNormal will be null and
     * collisionDistance and correctionDelta will be 0.
     */
    getTerrainArrayCollisionInfo() {
        let collisionTerrain = null;
        let collisionSegment = null;
        let segmentNormal = null;
        let collisionDistance = 0;
        let correctionDelta = 0;

        terrainArray.forEach(terrain => {
            let segments = terrain.segments;
            let corners = terrain.corners;
            let segmentCollisionDistances = [];

            for (let i = 0; i < segments.length; i++) {
                let segmentCollisionDistance = this.getSegmentCollisionDistance(segments[i], this.body.position);

                if (segmentCollisionDistance > COLLISION_THRESHOLD) {
                    segmentCollisionDistances[i] = segmentCollisionDistance;

                    if (i === segments.length - 1) {
                        let collisionInfo = this.getTerrainObjectCollisionInfo(
                            segments, segmentCollisionDistances, corners
                        );

                        if(collisionInfo.collisionSegment != null) {
                            collisionTerrain = terrain;
                            collisionSegment = collisionInfo.collisionSegment;

                            if(collisionInfo.correctionDelta === correctionDelta) {
                                segmentNormal = p5.Vector.add(segmentNormal, collisionInfo.segmentNormal).normalize();
                            } else {
                                segmentNormal = collisionInfo.segmentNormal;
                            }

                            collisionDistance = collisionInfo.collisionDistance;
                            correctionDelta = collisionInfo.correctionDelta;
                        }
                    }
                } else {
                    i = segments.length;
                }
            }
        });

        return {
            'collisionTerrain': collisionTerrain,
            'collisionSegment': collisionSegment,
            'collisionSegmentNormal': segmentNormal,
            'collisionDistance': collisionDistance,
            'correctionDelta': correctionDelta
        };
    }

    /**
     * Detects if this {@link Ball} is colliding with a specific {@link TerrainPolygon} and
     * returns various information about the collision if a collision occurred.
     *
     * @param segments {[TerrainSegment]}
     * The {@link TerrainSegment}s of the {@link TerrainPolygon}.
     *
     * @param segmentCollisionDistances {[number]}
     * How many meters this {@link Ball} has moved past the different {@link TerrainSegment}s.
     *
     * @param corners {[TerrainCorner]}
     * The {@link TerrainCorner}s of the terrain {@link TerrainPolygon}.
     *
     * @returns {{
     *  collisionSegment: TerrainSegment, segmentNormal: p5.Vector, collisionDistance: number, correctionDelta: number
     * }}
     * Various information about a collision.
     *
     * The collisionSegment is the {@link TerrainSegment} of the {@link TerrainPolygon}
     * this {@link Ball} is colliding with.
     *
     * The segmentNormal is the normal of the collisionSegment.
     *
     * The collisionDistance stores how many meters this {@link Ball} has moved into the {@link TerrainPolygon}.
     *
     * The correctionDelta stores how many seconds have to be reversed to undo the collision.
     */
    getTerrainObjectCollisionInfo(
        segments, segmentCollisionDistances, corners
    ) {
        let cornerOverwrite = false;

        let collisionSegment = null;
        let collisionSegmentNormal = null;
        let collisionDistance = 0;
        let correctionDelta = Infinity;

        corners.forEach(corner => {
            let cornerBallCenterDistance = p5.Vector.sub(this.body.position, corner.position).mag();
            cornerOverwrite = this.getCornerOverwrite(corner, cornerBallCenterDistance);
        })

        if (!cornerOverwrite) {
            for (let j = 0; j < segments.length; j++) {
                if (segmentCollisionDistances[j] > 0) {
                    let normalAngle = atan2(-segments[j].normal.y, -segments[j].normal.x);
                    let velocityAngle = atan2(this.velocity.y, this.velocity.x);
                    let ballNormalVelocity = this.velocity.mag() * cos(normalAngle - velocityAngle);

                    let newCorrectionDelta = abs(segmentCollisionDistances[j] / ballNormalVelocity);

                    if(newCorrectionDelta < correctionDelta) {
                        collisionSegment = segments[j];
                        collisionSegmentNormal = segments[j].normal;
                        collisionDistance = segmentCollisionDistances[j];
                        correctionDelta = newCorrectionDelta;
                    }
                }
            }
        }

        return {
            'collisionSegment': collisionSegment,
            'segmentNormal': collisionSegmentNormal,
            'collisionDistance': collisionDistance,
            'correctionDelta': correctionDelta
        };
    }

    /**
     * Returns how far this {@link Ball} has moved into a given {@link TerrainSegment}.
     *
     * Note that this method only checks how much the square, touching this {@link Ball}'s {@link body}'s topmost,
     * bottommost, rightmost, and leftmost point, has moved into the given terrain segment. Two conditions must be
     * met to confirm that this ball is actually overlapping with the given {@link TerrainSegment}.
     * The method {@link getCornerOverwrite} must return false for all {@link TerrainCorner}s
     * of the {@link TerrainPolygon} the given {@link TerrainSegment} belongs to. Additionally, this method must
     * return a distance bigger than 0.
     *
     * @param {TerrainSegment} terrainSegment
     * The given {@link TerrainSegment} this {@link Ball} might have moved into.
     *
     * @param {p5.Vector} position
     * The position this {@link Ball} takes during the distance calculation.
     *
     * @returns {number}
     * How far this {@link Ball} has moved into the given {@link TerrainSegment}.
     */
    getSegmentCollisionDistance(terrainSegment, position) {
        let distance = terrainSegment.distance - position.dot(terrainSegment.normal);

        if(distance > -this.body.getRadius()) {
            let leftBorderDistance = (
                terrainSegment.endBorderDistance - position.dot(terrainSegment.endBorderNormal)
            );

            let rightBorderDistance = (
                terrainSegment.startBorderDistance - position.dot(terrainSegment.startBorderNormal)
            );

            if(leftBorderDistance > -this.body.getRadius() && rightBorderDistance > -this.body.getRadius()) {
                return distance + this.body.getRadius();
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    /**
     * Returns true when this {@link Ball} is on the side of a given {@link TerrainCorner}, where this {@link Ball} is
     * guaranteed to be outside the {@link TerrainPolygon} the {@link TerrainCorner} belongs to.
     * Otherwise, this method returns false.
     *
     * @param {TerrainCorner} corner
     * The {@link TerrainCorner} that belongs to the {@link TerrainPolygon} for which is tested if this {@link Ball}
     * is guaranteed to be outside it.
     *
     * @param {number} cornerBallCenterDistance
     * How many meters are between the given {@link TerrainCorner} and this {@link Ball}'s {@link body}'s center.
     *
     * @returns {boolean}
     * If this {@link Ball} is guaranteed to be outside the {@link TerrainPolygon}
     * the given {@link TerrainCorner} belongs to.
     */
    getCornerOverwrite(corner, cornerBallCenterDistance) {
        return cornerBallCenterDistance > this.body.getRadius() - COLLISION_THRESHOLD && (
            (corner.verticalLocation === DIR_TP && corner.position.y < this.body.position.y) ||
            (corner.verticalLocation === DIR_BTM && corner.position.y > this.body.position.y) ||
            corner.verticalLocation === DIR_MID
        ) && (
            (corner.horizontalLocation === DIR_RGT && corner.position.x < this.body.position.x) ||
            (corner.horizontalLocation === DIR_LFT && corner.position.x > this.body.position.x) ||
            corner.horizontalLocation === DIR_MID
        );
    }

    /**
     * Returns how by how many m/s this {@link Ball} is speeded up, while rolling on the ground,
     * within the given duration of {@link delta}.
     *
     * @param {number} horizontalAirAcc
     * By how many m/s this {@link Ball} is speeded up horizontally, by the air, within {@link delta}'s time frame.
     *
     * @param {number} delta
     * Within how many seconds this {@link Ball} gets speeded up.
     *
     * @returns {p5.Vector}
     * How many m/s this {@link Ball} is speeded up horizontally and vertically.
     */
    getSegmentAcceleration(horizontalAirAcc, delta) {
        let seg = this.groundSegment;
        let segAngleSin = abs(seg.direction.y) / seg.direction.mag();
        let segAngleCos = abs(seg.direction.x) / seg.direction.mag();
        let rrc = this.rollResistanceCoefficient;
        let min = gravity * rrc * segAngleCos * delta;
        let sgn = sign(this.velocity.x, min);

        let segDir = p5.Vector.mult(seg.direction, seg.direction.y >= 0 ? -1 : 1);
        let segAcc = gravity * (segAngleSin - sgn * rrc * segAngleCos) * delta;

        segDir.setMag(segAcc + horizontalAirAcc);

        return segDir;
    }

    /**
     * Returns how by how many m/s this {@link Ball} is speeded up, while moving through the air,
     * within the given duration of {@link delta}.
     *
     * @param delta
     * Within how many seconds this ball gets speeded up.
     *
     * @returns {p5.Vector}
     * How many m/s this {@link Ball} is speeded up horizontally and vertically.
     */
    getAirAcceleration(delta) {
        let windVDifference = p5.Vector.sub(this.velocity, windVelocity);
        let x = -this.dm * windVDifference.mag() * windVDifference.x * delta;
        let y = -(gravity + this.dm * windVDifference.mag() * windVDifference.y) * delta;
        return createVector(x, y);
    }

    /**
     * Recalculates the value of this {@link Ball}'s {@link dm} field.
     */
    recalculateDM() {
        let area = Math.PI * this.body.getRadius() * this.body.getRadius();
        let dragCoefficient = 0.47;
        let drag = (dragCoefficient * airDensity * area) / 2;
        this.dm = drag / this.mass;
    }
}