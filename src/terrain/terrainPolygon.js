/**
 * Provides the {@link TerrainPolygon} class and
 * constants for the type field of {@link TerrainSegment} and {@link TerrainCorner} objects.
 *
 * @author Tizian Kirchner
 */

/**
 * Used as the value for the {@link TerrainSegment.type} field.
 * @type {number}
 */
const TERRAIN_SEGMENT = 0;

/**
 * Used as the value for the {@link TerrainCorner.type} field.
 * @type {number}
 */
const TERRAIN_CORNER = 1;

/**
 * A polygon made out of {@link TerrainSegment}s and {@link TerrainCorner}s.
 *
 * Encloses a piece of terrain and lets {@link Ball}s bounce off it.
 */
class TerrainPolygon {
    /**
     * The {@link TerrainSegment}s the {@link TerrainPolygon} is made out of.
     * @type {[TerrainSegment]}
     */
    segments;

    /**
     * The convex corners the {@link TerrainPolygon} is made out of.
     *
     * Required to have the convex corners, connecting the {@link segments}, working correctly.
     *
     * @type {[TerrainCorner]}
     */
    corners;

    /**
     * Constructs a new {@link TerrainPolygon} object.
     *
     * @param segments {[TerrainSegment]}
     * See {@link TerrainPolygon.segments}.
     *
     * @param corners {[TerrainCorner]}
     * See {@link TerrainPolygon.corners}.
     */
    constructor(segments, corners) {
        this.segments = segments;
        this.corners = corners;
    }
}