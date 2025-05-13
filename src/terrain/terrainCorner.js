/**
 * The convex corner of a {@link TerrainPolygon}, which {@link Ball} objects can bounce off.
 *
 * Required to connect two {@link TerrainSegment}s with a convex corner.
 * If the {@link TerrainSegment}s are not connected by a corner object,
 * {@link Ball} objects will not properly bounce off the {@link TerrainSegment}s convex corner.
 * Two segments connected by a concave corner do not require a corner object.
 *
 * @author Tizian Kirchner
 */
class TerrainCorner {
    /**
     * Determines the position of this {@link TerrainCorner}.
     * @type {Vector}
     */
    position;

    /**
     * Determines whether this {@link TerrainCorner} is a right or left corner
     * using either the {@link DIR_RGT} or {@link DIR_LFT} direction constant.
     *
     * Used by the {@link Ball.getCornerOverwrite} method for collision detection.
     *
     * @type {number}
     */
    horizontalLocation;

    /**
     * Determines whether this {@link TerrainCorner} is a top or bottom corner
     * using either the {@link DIR_TP} or {@link DIR_BTM} direction constant.
     *
     * Used by the {@link Ball.getCornerOverwrite} method for collision detection.
     *
     * @type {number}
     */
    verticalLocation;

    /**
     * This field should always be set to {@link TERRAIN_CORNER}.
     *
     * Used to differentiate between {@link TerrainSegment} and {@link TerrainCorner} objects.
     * @type {number}
     */
    type;

    /**
     * Constructs a new {@link TerrainCorner} object.
     *
     * @param position {p5.Vector}
     * See {@link TerrainCorner.position}.
     *
     * @param horizontalLocation {number}
     * See {@link TerrainCorner.horizontalLocation}.
     *
     * @param verticalLocation {number}
     * See {@link TerrainCorner.verticalLocation}.
     */
    constructor(position, horizontalLocation, verticalLocation) {
        this.position = position;
        this.horizontalLocation = horizontalLocation;
        this.verticalLocation = verticalLocation;
        this.type = TERRAIN_CORNER;
    }

    /**
     * Draws this corner as a green point.
     */
    draw() {
        stroke(CL_GRN);
        strokeWeight(canvasScale * 0.02);
        point(transformCxToPx(this.position.x), transformCyToPy(this.position.y));
    }

    toString() {
        return "Corner: (" + this.position.x + "; " + this.position.y + ")";
    }
}