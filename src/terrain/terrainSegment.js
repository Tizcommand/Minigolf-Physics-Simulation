/**
 * Provides the {@link TerrainSegment} class and functions for constructing {@link TerrainSegment} objects.
 * @author Tizian Kirchner
 */

/**
 * @param rectangle {Rectangle}
 * The {@link Rectangle} to construct the {@link TerrainSegment} for.
 *
 * @param orientation {number}
 * Determines for which of the {@link Rectangle}'s sides the {@link TerrainSegment} is created.
 * Should use one of the direction constants {@link DIR_TP}, {@link DIR_BTM}, {@link DIR_RGT} or {@link DIR_LFT}.
 *
 * @returns {TerrainSegment}
 * A new {@link TerrainSegment} object for one of the four sides of a {@link Rectangle}.
 */
function getTerrainSegmentFromRectangle(rectangle, orientation) {
    let startPoint;
    let endPoint;

    switch(orientation) {
        case DIR_TP:
            startPoint = createVector(rectangle.getRightX(), rectangle.getTopY());
            endPoint = createVector(rectangle.getLeftX(), rectangle.getTopY());
            break;
        case DIR_BTM:
            startPoint = createVector(rectangle.getLeftX(), rectangle.getBottomY());
            endPoint = createVector(rectangle.getRightX(), rectangle.getBottomY());
            break;
        case DIR_RGT:
            startPoint = createVector(rectangle.getRightX(), rectangle.getBottomY());
            endPoint = createVector(rectangle.getRightX(), rectangle.getTopY());
            break;
        case DIR_LFT:
            startPoint = createVector(rectangle.getLeftX(), rectangle.getTopY());
            endPoint = createVector(rectangle.getLeftX(), rectangle.getBottomY());
            break;
    }
    
    return new TerrainSegment(startPoint, endPoint);
}

/**
 * The segment of a {@link TerrainPolygon}, which {@link Ball} objects can bounce off.
 *
 * Divides the terrain from the air.
 */
class TerrainSegment {
    /* Direction Border */

    /**
     * The starting point of the {@link direction}.
     * @type {Vector}
     */
    startPoint;

    /**
     * The ending point of the {@link direction}.
     * @type {Vector}
     */
    endPoint;

    /**
     * A border going from the {@link startPoint} to the {@link endPoint}.
     *
     * Separates terrain and air.
     *
     * @type {Vector}
     */
    direction;

    /**
     * The normal vector of the {@link direction}.
     *
     * Always orthogonal to the {@link direction}.
     *
     * @type {Vector}
     */
    normal;

    /**
     * There is an infinitely long line aligned with the {@link direction}.
     *
     * This field stores the distance between that line and the canvas's origin.
     *
     * @type {number}
     */
    distance;

    /**
     * This field should always be set to {@link TERRAIN_SEGMENT}.
     *
     * Used to differentiate between {@link TerrainSegment} and {@link TerrainCorner} objects.
     *
     * @type {number}
     */
    type;

    /* End Border */

    /**
     * The normal {@link Vector} of the line that is orthogonal to the {@link direction} and
     * crossing the {@link endPoint}.
     *
     * Used by the {@link Ball.getSegmentCollisionDistance} method.
     *
     * @type {Vector}
     */
    endBorderNormal;

    /**
     * The endBorder is the line that is orthogonal to the {@link direction} and
     * crossing the {@link endPoint}.
     *
     * This field stores the distance between the endBorder and the canvas's origin.
     *
     * Used by the {@link Ball.getSegmentCollisionDistance} method.
     *
     * @type {number}
     */
    endBorderDistance;

    /* Start Border */

    /**
     * The normal {@link Vector} of the line that is orthogonal to the {@link direction} and
     * crossing the {@link startPoint}.
     *
     * Used by the {@link Ball.getSegmentCollisionDistance} method.
     *
     * @type {Vector}
     */
    startBorderNormal;

    /**
     * The startBorder is the line that is orthogonal to the {@link direction} and
     * crossing the {@link startPoint}.
     *
     * This field stores the distance between the startBorder and the canvas's origin.
     *
     * Used by the {@link Ball.getSegmentCollisionDistance} method.
     *
     * @type {number}
     */
    startBorderDistance;

    /**
     * Constructs a new {@link TerrainSegment} object.
     *
     * The new {@link TerrainSegment} uses a {@link direction} {@link Vector}
     * to create a border between terrain and air.
     * This {@link direction} {@link Vector} has a {@link normal} {@link Vector} which points towards the air,
     * away from the terrain.
     *
     * If the segment's {@link startPoint} is further right than the segment's {@link endPoint},
     * the {@link normal} {@link Vector} will point upwards.
     *
     * If the {@link startPoint} is further left than the {@link endPoint},
     * the {@link normal} {@link Vector} will point downwards.
     *
     * If the {@link startPoint} and {@link endPoint} have the same x position and
     * the {@link startPoint} is above the {@link endPoint},
     * the {@link normal} {@link Vector} will point straight to the left.
     *
     * If the {@link startPoint} and {@link endPoint} have the same x position and
     * the {@link startPoint} is under the {@link endPoint},
     * the {@link normal} {@link Vector} will point straight to the right.
     *
     * @param startPoint {p5.Vector}
     * See {@link TerrainSegment.startPoint}.
     *
     * @param endPoint {p5.Vector}
     * See {@link TerrainSegment.endPoint}.
     */
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.direction = p5.Vector.sub(endPoint, startPoint);
        this.normal = createVector(this.direction.y, -this.direction.x).setMag(1);
        this.distance = startPoint.dot(this.normal);
        this.type = TERRAIN_SEGMENT;

        this.endBorderNormal = this.direction.copy().setMag(1);
        this.endBorderDistance = endPoint.dot(this.endBorderNormal);

        this.startBorderNormal = p5.Vector.mult(this.endBorderNormal, -1);
        this.startBorderDistance = startPoint.dot(this.startBorderNormal);
    }

    /**
     * Draws this {@link TerrainSegment}'s {@link direction} in white and its {@link normal} in green.
     */
    draw() {
        let startPoint = createVector(
            transformCxToPx(this.startPoint.x), transformCyToPy(this.startPoint.y)
        );

        let endPoint = createVector(
            transformCxToPx(this.endPoint.x), transformCyToPy(this.endPoint.y)
        );

        stroke(fgCl);
        strokeWeight(canvasScale * 0.01);
        line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        let normalStart = createVector(
            this.startPoint.x + this.direction.x / 2, this.startPoint.y + this.direction.y / 2
        );

        let normalEnd = p5.Vector.add(normalStart, p5.Vector.div(this.normal, 4));

        stroke(CL_GRN);
        line(
            transformCxToPx(normalStart.x), transformCyToPy(normalStart.y),
            transformCxToPx(normalEnd.x), transformCyToPy(normalEnd.y)
        );
    }

    toString() {
        return "TerrainSegment: (" + this.direction.x + "; " + this.direction.y + ")";
    }
}