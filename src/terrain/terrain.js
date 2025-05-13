/**
 * Stores terrain visualizations and {@link TerrainPolygon}s and provides functions for terrain initialization,
 * resetting and drawing.
 *
 * @author Tizian Kirchner
 */

/* Slope */

let slope;
const slopeX = 0.00;
const slopeY = 0.50;
const slopeW = 1.00;
const slopeH = 0.50;

let slopeTerrain;

/* Ground */

let lftGround;
let rgtGround;
let btmGround;
const tpGroundY = 0.00;

let lftGroundTerrain;
let rgtGroundTerrain;
let btmGroundTerrain;

/* Catapult */

/**
 * A triangle to which's top corner a spring is attached.
 *
 * The spring is used to launch the {@link ball} from the catapult.
 *
 * @type {Triangle}
 */
let catapult;

/**
 * Stores the position of the catapult as a {@link Vector}.
 *
 * @type {Vector}
 */
let catapultPosition;

/**
 * Stores the height of the {@link catapult}.
 *
 * @type {number}
 */
const catapultH = 0.50;

/**
 * Stores the width of the {@link catapult}.
 *
 * @type {number}
 */
const catapultW = 0.24;

/**
 * Handles the collision between the {@link catapult} and the {@link ball}.
 *
 * @type {TerrainPolygon}
 */
let catapultTerrain;

/**
 * Determines whether the {@link catapultTerrain} has been added to the {@link terrainArray}.
 *
 * @type {boolean}
 */
let catapultTerrainAdded = false;

/* Wall */

let wall;
let wallTerrain;

/* Obstacle */

let obstacle;
let obstacleTerrain;

/* Terrain Array */

/**
 * Stores the {@link TerrainPolygon}s of the simulation.
 *
 * @type {TerrainPolygon[]}
 * @see initializeTerrain
 */
let terrainArray;

/**
 * Initializes all the simulation's terrain visualizations and {@link TerrainPolygon}s.
 *
 * All the {@link TerrainPolygon}s, except the {@link catapultTerrain},
 * will be referenced through the {@link terrainArray}.
 * The {@link catapultTerrain} is added to the {@link terrainArray} later, through the function {@link simulatePhysics},
 * to avoid collision between the {@link ball} and the {@link catapultTerrain} during the {@link ball}'s launch.
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
 * Removes the {@link catapultTerrain} from the {@link terrainArray}
 * if the {@link catapultTerrain} has been added to the array.
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
 * Draws all {@link TerrainSegment}s and {@link TerrainCorner}s of the {@link terrainArray}.
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