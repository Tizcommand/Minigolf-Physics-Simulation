let TERRAIN_SEGMENT = 0;
let TERRAIN_CORNER = 1;

/**
 * A Polygon made out of terrain segments and terrain corners.
 *
 * Encloses a piece of terrain and lets the ball bounce off it.
 *
 * @see TerrainSegment
 * @see TerrainCorner
 */
class TerrainPolygon {
    /**
     * Returns a new terrain polygon object.
     *
     * @param segments {[TerrainSegment]}
     * The segments the new terrain polygon is made out of.
     *
     * @param corners {[TerrainCorner]}
     * The convex corners the new terrain polygon is made out of. Required to have the convex corners attached
     * terrain segments working correctly.
     *
     * @see TerrainSegment
     * @see TerrainCorner
     */
    constructor(segments, corners) {
        this.segments = segments;
        this.corners = corners;
    }
}