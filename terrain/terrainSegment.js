/**
 * Returns a new terrain segment object for one of the four side of a rectangle.
 *
 * @class TerrainSegment
 *
 * @param rectangle {Rectangle}
 * The rectangle to create the terrain segment for.
 *
 * @param orientation {number}
 * Determines for which of the rectangles sides the segment is created. Should use one of the constants DIR_TP,
 * DIR_BTM, DIR_RGT or DIR_LFT.
 *
 * @returns {TerrainSegment}
 * A new terrain segment object for one of the four side of a rectangle.
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
 * Segment of a terrain polygon, which ball objects can bounce on.
 *
 * Divides the terrain from the air.
 *
 * @see TerrainPolygon
 */
class TerrainSegment {
    /**
     * Returns a new terrain segment object.
     *
     * The new terrain segment uses a line between two points to create a border between terrain and air. The
     * segment has a normal vector which points towards the air, away from the terrain. The normal vector is always
     * orthogonal the segment's borderline.
     *
     * If the start point is further right than the end point, the normal vector will point downwards.
     *
     * If the start point is further left than the end point, the normal vector will point upwards.
     *
     * If the start point and end point have the same x position and the start point is above the end point, the
     * normal vector will point straight to the left.
     *
     * If the start point and end point have the same x position and the start point is under the end point, the
     * normal vector will point straight to the right.
     *
     * @param startPoint {p5.Vector}
     * The point where the borderline starts.
     *
     * @param endPoint {p5.Vector}
     * The point where the borderline ends.
     */
    constructor(startPoint, endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.direction = p5.Vector.sub(endPoint, startPoint);
        this.normal = createVector(this.direction.y, -this.direction.x).setMag(1);
        this.distance = startPoint.dot(this.normal);
        this.type = TERRAIN_SEGMENT;

        this.leftBorderNormal = this.direction.copy().setMag(1);
        this.leftBorderDistance = endPoint.dot(this.leftBorderNormal);

        this.rightBorderNormal = p5.Vector.mult(this.leftBorderNormal, -1);
        this.rightBorderDistance = startPoint.dot(this.rightBorderNormal);
    }

    /**
     * Draws this terrain segment's borderline in white and its normal vector in green.
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