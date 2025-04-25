/**
 * Circle which can bounce off terrain, roll on the ground and react to wind.
 */
class Ball {
    /**
     * Returns a new ball object.
     *
     * @param body {Circle}
     * The circle which makes up the balls body.
     *
     * @param mass {number}
     * Higher mass means the ball is less affected by the spring and the wind, but more affected by gravity.
     *
     * @param rollResistanceCoefficient {number}
     * The higher this coefficient, the faster the ball comes to a stop when rolling on the ground.
     */
    constructor(body, mass, rollResistanceCoefficient) {
        // determined by parameters
        this.body = body;
        this.mass = mass;
        this.rollResistanceCoefficient = rollResistanceCoefficient;
        this.dm = this.getDM();

        // not updated each frame
        this.groundSegment = null;
        this.groundTerrain = null;

        // updated each frame
        this.velocity = createVector(0, 0);
        this.airAcceleration = createVector(0, 0);
        this.segmentAcceleration = createVector(0, 0);
        this.resetCollisionInformation();
    }

    /**
     * Bounces this ball off terrain, rolls it on the ground and affects it through wind.
     *
     * @param delta {number}
     * For how many seconds to simulate this ball.
     */
    simulate(delta) {
        this.addAcceleration(delta);
        this.resetCollisionInformation();

        do {
            // check if error occurred
            if(
                isNaN(this.velocity.x) || isNaN(this.velocity.y) ||
                this.velocity.x === Infinity || this.velocity.y === Infinity ||
                this.loopCounter >= 100
            ) {
                state = STATE_ERROR;
                return;
            }

            // check if ball collided
            let collisionInfo = this.getTerrainArrayCollisionInfo();

            if (collisionInfo.collisionDistance !== 0) {
                this.moveOutOfTerrain(collisionInfo, delta);
            } else {
                if (this.collided) { // check if ball should be reflected
                    // check if ball collided with corner or segment
                    let collisionObjectAndNormal = this.getCollisionObjectAndNormal();
                    let collisionObject = collisionObjectAndNormal.collisionObject;
                    let collisionNormal = collisionObjectAndNormal.collisionNormal;

                    if (this.groundSegment == null) { // check if ball should be reflected in air
                        let oldVelocity = this.velocity.copy();
                        this.reflectInAir(collisionObject, collisionNormal, delta);
                        if(DEBUG) logAirReflection(oldVelocity, collisionObject, collisionNormal);
                    } else { // reflect ball on ground
                        let oldVelocity = this.velocity.copy();
                        let groundSegmentDir = this.groundSegment.direction;
                        this.reflectOnGround(collisionObject, this.segmentAcceleration, delta);
                        if(DEBUG) logGroundReflection(oldVelocity, collisionObject, groundSegmentDir);
                    }

                    this.collided = false;
                    delta = this.correctionDeltaSum;
                } else {
                    if(this.isOffGround()) { // check if ball should fall off ground
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
     * Resets all collision related information stored by this ball.
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
     * Accelerates this ball.
     *
     * Depending on whether this ball is in the air or on the ground, it will be accelerated differently.
     *
     * @param delta {number}
     * For how many seconds to accelerate this ball.
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
     * Moves this ball out of the terrain it collided with and stores various information about the collision that
     * occurred.
     *
     * @param collisionInfo {{
     *  collisionTerrain: TerrainPolygon, collisionSegment: TerrainSegment, collisionSegmentNormal: p5.Vector,
     *  collisionDistance: number, correctionDelta: number
     * }}
     * Various information about a collision.
     *
     * The collision terrain is the terrain object this ball is colling with.
     *
     * The collision segment is the segment of the terrain object this ball is colliding with.
     *
     * The collision segment normal is the normal of the segment the ball is colliding with.
     *
     * The collision distance describes how many meters this ball has moved into the terrain object.
     *
     * The correction delta describes how many seconds time has to be reversed to undo the collision.
     *
     * @param delta
     * How many seconds passed between the current and the last frame.
     */
    moveOutOfTerrain(collisionInfo, delta) {
        // store collision information
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

        // correct the balls position
        let correctionVector;
        let correctionType;

        if(
            (this.groundSegment != null && this.collisionSegment === this.groundSegment) ||
            this.oldCollisionDistance < collisionDistance
        ) {
            // Fallback that is used if this ball was pushed further into the terrain, the last time this method was
            // called. Uses the collision segment's normal and the collision distance to correct the balls position.
            correctionVector = p5.Vector.mult(this.collisionSegment.normal, collisionDistance);
            correctionType = "Normal";
        } else {
            // default correction procedure, reversing some of the balls movement
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
     * Reflects this ball off terrain if while it is in the air.
     *
     * Starts to let this ball rolling on the ground, if it collided with a terrain segment, and the balls velocity
     * after the reflection, along the terrain segment's normal, is smaller than the BOUNCING_THRESHOLD constant.
     * The collision segment's normal must be at least slightly pointing upwards for the ball to start rolling.
     *
     * @param {TerrainSegment | TerrainCorner} collisionObject
     * The object this ball collided with.
     *
     * @param {p5.Vector} collisionNormal
     * The normal of the collision object.
     *
     * @param {number} delta
     * How many seconds passed between the current and the last frame.
     *
     * @see BOUNCING_THERSHOLD
     */
    reflectInAir(collisionObject, collisionNormal, delta) {
        // subtract approximate superfluous air acceleration
        this.velocity.sub(this.airAcceleration.copy().mult(this.correctionDeltaSum / delta));

        // check if ball is still moving
        let ballNormalVelocity = 0;

        if(this.velocity.mag() > 0) {
            // reflect ball
            let normalVelocityAngle = collisionNormal.angleBetween(this.velocity);
            this.velocity.rotate(-normalVelocityAngle * 2);
            this.velocity.mult(-1);

            // decrease ball normal velocity by 20%
            let normalAngle = atan2(collisionNormal.y, collisionNormal.x);
            let velocityAngle = atan2(this.velocity.y, this.velocity.x);
            ballNormalVelocity = this.velocity.mag() * cos(normalAngle - velocityAngle);
            this.velocity.sub(p5.Vector.mult(collisionNormal, ballNormalVelocity * 0.2));

            // check if ball starts rolling
            velocityAngle = atan2(this.velocity.y, this.velocity.x);
            ballNormalVelocity = this.velocity.mag() * cos(normalAngle - velocityAngle);
        }

        if (
            ballNormalVelocity < BOUNCING_THRESHOLD &&
            collisionObject.type === TERRAIN_SEGMENT &&
            collisionObject.direction.x < 0
        ) {
            // set ball to start rolling
            this.groundTerrain = this.collisionTerrain;
            this.groundSegment = collisionObject;
            let segmentAcc = createVector(0, 0);
            this.reflectOnGround(collisionObject, segmentAcc, delta);
        } else {
            // add corrected air acceleration
            this.airAcceleration = this.getAirAcceleration(this.correctionDeltaSum);
            this.addReflectionAcceleration(this.airAcceleration);

            // position ball
            this.body.position.add(p5.Vector.mult(this.velocity, this.correctionDeltaSum));
        }
    }

    /**
     * Reflects this ball off terrain while it is rolling on ground.
     *
     * @param {TerrainSegment | TerrainCorner} collisionObject
     * The object this ball collided with.
     *
     * @param {p5.Vector} segmentAcc
     * How much this ball was accelerated horizontally and vertically between the current and the last frame.
     *
     * @param {number} delta
     * How many seconds passed between the current and the last frame.
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
     * Returns if this ball has left the ground.
     *
     * @returns {boolean} If this ball has left the ground.
     */
    isOffGround() {
        if (this.groundSegment != null) {
            let corners = this.groundTerrain.corners;
            let testNormal = p5.Vector.mult(this.groundSegment.normal, COLLISION_THRESHOLD);
            let ballTestPosition = this.body.position.copy().sub(testNormal);
            let segmentCollisionDistance = this.getSegmentCollisionDistance(this.groundSegment, ballTestPosition);
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
     * How many seconds passed between the current and the last frame.
     *
     * @returns {number}
     * How many seconds passed between this ball arriving at the ledge's corner and this frame.
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

            // put ball on corner
            let correctionVector = p5.Vector.mult(this.velocity, correctionDelta);
            this.body.position.sub(correctionVector);

            // subtract approximate superfluous segment acceleration
            this.velocity.sub(this.segmentAcceleration.copy().mult(correctionDelta / delta));

            // add air acceleration
            let airAcc = this.getAirAcceleration(correctionDelta);
            this.addReflectionAcceleration(airAcc);

            // correct ball position
            this.body.position.add(p5.Vector.mult(this.velocity, correctionDelta));
        }

        this.groundSegment = null;
        return correctionDelta;
    }

    /**
     * Accelerates this ball after it was reflected of terrain.
     *
     * If this balls horizontal/vertical velocity is smaller than the horizontal/vertical reflection acceleration,
     * this ball will not be accelerated horizontal/vertical to prevent the ball from getting stuck in the terrain
     * trough floating point rounding errors.
     *
     * @param {p5.Vector} reflectionAcceleration
     * How much this ball is accelerated horizontally and vertically.
     */
    addReflectionAcceleration(reflectionAcceleration) {
        let xOk = abs(reflectionAcceleration.x) < abs(this.velocity.x);
        let yOk = abs(reflectionAcceleration.y) < abs(this.velocity.y);

        if(xOk && yOk) {
            this.velocity.add(reflectionAcceleration);
        } else if(yOk) {
            this.velocity.x = 0;
            this.velocity.y += reflectionAcceleration.y;
        } else if(xOk) {
            this.velocity.x += reflectionAcceleration.x;
            this.velocity.y = 0;
        }
    }

    /**
     * Determines if this ball has collided with a terrain segment or corner and returns the corresponding object, and
     * it's normal.
     *
     * @returns {{collisionObject: TerrainSegment | TerrainCorner, collisionNormal: p5.Vector}}
     * The collision object, either a terrain segment or corner, and it's normal.
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
     * Detects if this ball is colliding with one of the terrain objects in the terrain array and returns various
     * information about the collision, if a collision occurred.
     *
     * @returns {{
     *  collisionTerrain: TerrainPolygon, collisionSegment: TerrainSegment, collisionSegmentNormal: p5.Vector,
     *  collisionDistance: number, correctionDelta: number
     * }}
     * Various information about a collision.
     *
     * The collision terrain is the terrain object this ball is colling with.
     *
     * The collision segment is the segment of the terrain object this ball is colliding with.
     *
     * The collision segment normal is the normal of the segment the ball is colliding with.
     *
     * The collision distance describes how many meters this ball has moved into the terrain object.
     *
     * The correction delta describes how many seconds time has to be reversed to undo the collision.
     *
     * If no collision occurred, collision terrain, collision segment and collision segment normal will be null and
     * minimum collision distance and correction delta will be 0.
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
     * Detects if this ball is colliding with a specific terrain object and
     * returns various information about the collision, if a collision occurred.
     *
     * @param segments {[TerrainSegment]}
     * The segments of the terrain object.
     *
     * @param segmentCollisionDistances {[number]}
     * How many meters this ball has moved past the different terrain segments.
     *
     * @param corners {[TerrainCorner]}
     * The corners of the terrain object.
     *
     * @returns {{
     *  collisionSegment: TerrainSegment, segmentNormal: p5.Vector, collisionDistance: number, correctionDelta: number
     * }}
     * Various information about a collision.
     *
     * The collision segment is the segment of the terrain object this ball is colliding with.
     *
     * The collision segment normal is the normal of the segment the ball is colliding with.
     *
     * The collision distance describes how many meters this ball has moved into the terrain object.
     *
     * The correction delta describes how many seconds time has to be reversed to undo the collision.
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
     * Returns how far this ball has moved into a given terrain segment.
     *
     * Note that this method only checks how much the square, surrounding this ball's body, has moved into the given
     * terrain segment. Two conditions must be met to confirm that this ball is actually overlapping with the given
     * terrain segment. The method getCornerOverwrite must return false for all corners of the terrain object the given
     * terrain segment belongs to. Additionally, this method must return a distance bigger than 0.
     *
     * @see getCornerOverwrite
     *
     * @param {TerrainSegment} terrainSegment
     * The terrain segment, for which this method is checking how far this ball has moved into it.
     *
     * @param {p5.Vector} position
     * The position this ball takes during the distance calculation.
     *
     * @returns {number}
     * How far this ball has moved into the given terrain segment.
     */
    getSegmentCollisionDistance(terrainSegment, position) {
        let distance = terrainSegment.distance - position.dot(terrainSegment.normal);

        if(distance > -this.body.getRadius()) {
            let leftBorderDistance = (
                terrainSegment.leftBorderDistance - position.dot(terrainSegment.leftBorderNormal)
            );

            let rightBorderDistance = (
                terrainSegment.rightBorderDistance - position.dot(terrainSegment.rightBorderNormal)
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
     * Returns true when this ball is on the side of a given corner, where this ball is guaranteed to be outside the
     * terrain object the corner belongs to. Otherwise, this method returns false.
     *
     * @param {TerrainCorner} corner
     * The corner for which is tested, if the ball guaranteed to be outside the terrain object the corner belongs to.
     *
     * @param {number} cornerBallCenterDistance
     * How much meters distance are between the given corner and this ball's body's center.
     *
     * @returns {boolean}
     * If this ball is guaranteed to be outside the terrain object the given corner belongs to.
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
     * Returns how by how many m/s this ball is accelerated, while rolling on the ground, within the given timeframe
     * delta.
     *
     * @param {number} horizontalAirAcc
     * By how many m/s this ball is accelerated horizontally, by the air, within delta.
     *
     * @param {number} delta
     * Within how many seconds this ball gets accelerated.
     *
     * @returns {p5.Vector}
     * How many m/s this ball is accelerated horizontally and vertically.
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
     * Returns how by how many m/s this ball is accelerated, while moving through the air, within the given timeframe
     * delta.
     *
     * @param delta
     * Within how many seconds this ball gets accelerated.
     *
     * @returns {p5.Vector}
     * How many m/s this ball is accelerated horizontally and vertically.
     */
    getAirAcceleration(delta) {
        let windVDifference = p5.Vector.sub(this.velocity, windVelocity);
        let x = -this.dm * windVDifference.mag() * windVDifference.x * delta;
        let y = -(gravity + this.dm * windVDifference.mag() * windVDifference.y) * delta;
        return createVector(x, y);
    }

    /**
     * Returns this ball's drag divided by its mass. This value is used to calculate by how many m/s this ball is
     * accelerated by the air.
     *
     * @returns {number} This ball's drag divided by its mass.
     */
    getDM() {
        let area = Math.PI * this.body.getRadius() * this.body.getRadius();
        let dragCoefficient = 0.47;
        let drag = (dragCoefficient * airDensity * area) / 2;
        return drag / this.mass;
    }
}