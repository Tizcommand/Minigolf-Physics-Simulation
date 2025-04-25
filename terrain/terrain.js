/**
 * Stores terrain visualizations and polygons and provides a function for terrain initialization, resetting and
 * drawing.
 */

// terrain visualizations
let wall;
let obstacle;

const slopeX = 0.00;
const slopeY = 0.50;
const slopeW = 1.00;
const slopeH = 0.50;
let slope;

const tpGroundY = 0.00;
let lftGround;
let rgtGround;
let btmGround;

const catapultH = 0.50;
const catapultW = 0.24;
let catapultPosition;
let catapult;

// terrain shapes
let terrainArray;
let wallTerrain;
let obstacleTerrain;
let slopeTerrain;
let lftGroundTerrain;
let rgtGroundTerrain;
let btmGroundTerrain;

let catapultTerrainAdded = false;
let catapultTerrain;

/**
 * Initializes all the simulation's terrain visualizations and polygons.
 *
 * All the polygons, except the catapult terrain, will be referenced in the terrain array. The catapult terrain is
 * added to the terrain array later, through the function simulatePhysics, to avoid collision between the golf ball
 * and the catapult during the golf ball's launch.
 *
 * @see simulatePhysics
 */
function initializeTerrain() {
    // terrain visualization initialization
    catapultPosition = createVector(9.00, 0.50);

    wall = new Rectangle(-0.25, 100, 0.25, 100, CL_BLU);
    obstacle = new Rectangle(6.63, 0.50, 0.24, 0.50, CL_RD);
    slope = getRightTriangle(slopeX, slopeY, slopeW, slopeH, CL_BLU, DIR_BTM_LFT);

    let x = catapultPosition.x;
    let y = catapultPosition.y;
    catapult = getIsoscelesTriangle(x, y, catapultH, catapultW, CL_DRK_GRN, -90);

    lftGround = new Rectangle(-0.25, tpGroundY, 2.50, 0.40, CL_BLU);
    rgtGround = new Rectangle(2.65, tpGroundY, 7.65, 0.40, CL_BLU);
    btmGround = new Rectangle(-0.25, -0.40, 10.50, 0.25, CL_BLU);

    // terrain object initialization
    wallTerrain = new TerrainPolygon(
        [getTerrainSegmentFromRectangle(wall, DIR_RGT)],
        []
    );

    obstacleTerrain = new TerrainPolygon(
        [
            getTerrainSegmentFromRectangle(obstacle, DIR_TP),
            getTerrainSegmentFromRectangle(obstacle, DIR_RGT),
            getTerrainSegmentFromRectangle(obstacle, DIR_LFT)
        ],
        [
            new TerrainCorner(createVector(obstacle.getRightX(), obstacle.getTopY()), DIR_RGT, DIR_TP),
            new TerrainCorner(createVector(obstacle.getLeftX(), obstacle.getTopY()), DIR_LFT, DIR_TP)
        ]
    );

    slopeTerrain = new TerrainPolygon(
        [
            new TerrainSegment(createVector(slopeX + slopeW, slopeY - slopeH), createVector(slopeX, slopeY))
        ],
        []
    );

    lftGroundTerrain = new TerrainPolygon(
        [
            getTerrainSegmentFromRectangle(lftGround, DIR_TP),
            getTerrainSegmentFromRectangle(lftGround, DIR_RGT)
        ],
        [new TerrainCorner(createVector(lftGround.getRightX(), lftGround.getTopY()), DIR_RGT, DIR_TP)]
    );

    rgtGroundTerrain = new TerrainPolygon(
        [
            getTerrainSegmentFromRectangle(rgtGround, DIR_TP),
            getTerrainSegmentFromRectangle(rgtGround, DIR_LFT)
        ],
        [new TerrainCorner(createVector(rgtGround.getLeftX(), rgtGround.getTopY()), DIR_LFT, DIR_TP)]
    );

    btmGroundTerrain = new TerrainPolygon(
        [getTerrainSegmentFromRectangle(btmGround, DIR_TP)],
        []
    );

    catapultTerrain = new TerrainPolygon(
        [
            new TerrainSegment(
                catapultPosition,
                createVector(catapultPosition.x - catapultW / 2, catapultPosition.y - catapultH)
            ),
            new TerrainSegment(
                createVector(catapultPosition.x + catapultW / 2, catapultPosition.y - catapultH),
                catapultPosition
            )
        ],
        [new TerrainCorner(createVector(catapultPosition.x, catapultPosition.y), DIR_MID, DIR_TP)]
    );

    terrainArray = [wallTerrain, slopeTerrain, lftGroundTerrain, rgtGroundTerrain, btmGroundTerrain, obstacleTerrain];
}

/**
 * Removes the catapult terrain from the terrain array, if the catapult terrain has been added to the array.
 *
 * @see initializeTerrain
 * @see simulatePhysics
 */
function resetTerrain() {
    if(terrainArray.includes(catapultTerrain)) {
        terrainArray.pop();
        catapultTerrainAdded = false;
    }
}

/**
 * Draws all terrain segments and corners of the terrain array.
 */
function drawTerrainColliders() {
    terrainArray.forEach(terrain => {
        terrain.segments.forEach(segment => {
            segment.draw();
        });

        terrain.corners.forEach(corner => {
            corner.draw();
        })
    });
}