/**
 * Convex corner of a terrain polygon, which ball objects can bounce on.
 *
 * Required to connect two terrain segments with a convex corner. If the segments are not connected by a corner
 * object, balls will not properly bounce off the terrain segments convex corner. Two segments with a concave corner
 * do not require a corner object.
 *
 * @see TerrainPolygon
 */
class TerrainCorner {
    /**
     * Returns a new terrain corner object.
     *
     * The horizontal and vertical location are used by the ball class's getCornerOverwrite method for collision
     * detection.
     *
     * @param position {p5.Vector}
     * Determines the position of the new terrain corner.
     *
     * @param horizontalLocation {number}
     * Determines whether the new terrain corner is a right or left corner using either the constant DIR_RGT or DIR_LFT.
     *
     * @param verticalLocation {number}
     * Determines whether the new terrain corner is a top or bottom corner using either the constant DIR_TP or DIR_BTM.
     *
     * @see Ball.getCornerOverwrite
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