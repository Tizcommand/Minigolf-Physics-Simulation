/**
 * The central script of the simulation, mainly used for issuing drawing of its visuals to the browser window.
 *
 * Provides functions for setting up the program and updating its objects, managing mouse input and converting between
 * cartesian coordinates and pixel coordinates.
 *
 * When an object is initialized, its size and coordinate are always expressed in meters and cartesian coordinates.
 * When an object is drawn, the simulation converts its position from cartesian coordinates to pixel coordinates.
 * The size is converted from meters to pixels. This is done to make the objects drawn to the canvas
 * scalable to different window sizes.
 *
 * A custom origin can be specified for the cartesian coordinate system,
 * whereas the pixel coordinate system's origin is always in the top left corner of the canvas.
 * The cartesian coordinate system's coordinates increase towards the top right,
 * whereas the pixel coordinate system's coordinates increase towards the bottom right.
 *
 * @author Tizian Kirchner
 */

/* origin coordinates */

/**
 * The origin's cartesian x coordinate.
 * @type {number}
 */
let cX0;

/**
 * The origin's cartesian y coordinate.
 * @type {number}
 */
let cY0;

/**
 * The origin's pixel x coordinate.
 * @type {number}
 */
let pX0;

/**
 * The origin's pixel y coordinate.
 * @type {number}
 */
let pY0;

/* dimensions */

/**
 * The canvas's width in meters.
 * @type {number}
 */
const CANVAS_C_W = 10.50;

/**
 * The canvas's width in pixels.
 * @type {number}
 */
let canvasPW = window.innerWidth;

/**
 * The canvas's height in pixels.
 * @type {number}
 */
let canvasPH = window.innerHeight;

/**
 * A scale that is applied to all visuals on the canvas.
 *
 * Used to horizontally fit all visuals into the browser window. Visuals will still disappear vertically if the
 * browser window is too wide. If the browser window is too tall, visuals will appear very small.
 *
 * @type {number}
 */
let canvasScale = window.innerWidth / CANVAS_C_W;

/* directions */

const DIR_TP = 0;
const DIR_TP_LFT = 1;
const DIR_TP_RGT = 2;
const DIR_BTM = 3;
const DIR_BTM_LFT = 4;
const DIR_BTM_RGT = 5;
const DIR_LFT = 6;
const DIR_RGT = 7;
const DIR_MID = 8;

/* color palette by MortMort: https://lospec.com/palette-list/softmilk-32 */

const CL_WT = '#f2f2f0';
const CL_BLK = '#23213d';
const CL_LGT_BLU = '#7cd8eb';
const CL_BLU = '#4884d4';
const CL_DRK_BLU = '#454194';
const CL_YLW = '#f3d040';
const CL_RD = '#bd515a';
const CL_DRK_RD = '#903d62';
const CL_GRN = '#1f9983';
const CL_DRK_GRN = '#22636b';

/**
 * The canvas's background color.
 * @type {string}
 */
let bgCl = CL_WT;

/**
 * The canvas's foreground color.
 * @type {string}
 */
let fgCl = CL_BLK;

/* Functions */

/**
 * Initializes the canvas and various elements of the program.
 *
 * Is the first function called by the program, after the p5 library's functions.
 */
function setup() {
	createCanvas(canvasPW, canvasPH);
	frameRate(1000);
	setOrigin(0.25, 0.50);
	randomizeWind();
	applyWindToFlag();

	initializeUi();
	initializeTerrain();
	initializeSpring();
	initializeFlag();
	initializeBall();
}

/**
 * Draws the UI and the games visuals to the browser window.
 *
 * Is called once every frame. Calls functions to update other objects of the program.
 */
function draw() {									
	/* setup */
	
	// adjust colors for light or dark mode
	if (window.matchMedia) {
		if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
			bgCl = CL_BLK;
			fgCl = CL_WT;
		} else {
			bgCl = CL_WT;
			fgCl = CL_BLK;
		}	
	}

	background(bgCl);

	// update objects
	let delta = getDeltaInSec();
	updateUi(delta);
	simulatePhysics(delta);

	/* display */
	setOrigin(0.25, 0.50);

	// UI
	drawUi();

	// terrain
	stroke(CL_BLU);
	strokeWeight(1);
	wall.draw();
	slope.draw();
	lftGround.draw();
	rgtGround.draw();
	btmGround.draw();

	strokeWeight(0);
	obstacle.draw();

	if(DEBUG) drawTerrainColliders();

	// flag
	strokeWeight(0);
	flagpole.color = fgCl;
	flagpole.draw();

	stroke(CL_BLU);
	strokeWeight(0.01 * canvasScale);
	flag.draw();
	
	// catapult
	strokeWeight(0);
	catapult.draw();

	// spring
	if(state === STATE_SPRING_ATTACHED || state === STATE_SPRING_RELEASE) {
		let x = catapultPosition.x;
		let y = catapultPosition.y;
		let w = springVector.mag();
		let h = ball.body.diameter;

		getIsoscelesTriangle(x, y, w, h, CL_LGT_BLU, degrees(springPhi)).draw();
	}

	// ball
	ball.body.draw();
}

/* Mouse Input Functions */

/**
 * Checks if UI elements or the ball have been pressed by the mouse cursor and takes according actions.
 */
function mousePressed() {
	PressUi();
	checkBallPressed();
}

/**
 * Checks if UI elements or the ball have been released by the mouse cursor and takes according actions.
 */
function mouseReleased() {
	releaseUi();
	checkBallReleasedByMouse();
}

/* Transformation Functions */

/**
 * Adjust the canvas's size and the scale of visible objects according to the window size.
 */
function windowResized() {
	canvasPW = window.innerWidth;
	canvasPH = window.innerHeight;
	canvasScale = canvasPW / CANVAS_C_W;
	resizeCanvas(canvasPW, canvasPH);
}

/**
 * Sets the origin coordinates of the cartesian coordinate system. The origin of the pixel coordinate system is
 * adjusted accordingly.
 *
 * @param {number} x
 * Determines the cartesian coordinate system's origin's x position.
 *
 * @param {number} y
 * Determines the cartesian coordinate system's origin's y position.
 */
function setOrigin(x, y) {
	cX0 = x;
	cY0 = y;
	pX0 = x * canvasScale;
	pY0 = canvasPH - y * canvasScale;
}

/**
 * Transforms a pixel x coordinate to the corresponding cartesian x coordinate.
 *
 * @param x {number} The pixel x coordinate.
 *
 * @returns {number} The cartesian x coordinate.
 */
function transformPxToCx(x) {
	return (x - pX0) / canvasScale;
}

/**
 * Transforms a pixel y coordinate to the corresponding cartesian y coordinate.
 *
 * @param y {number} The pixel y coordinate.
 *
 * @returns {number} The cartesian y coordinate.
 */
function transformPyToCy(y) {
	return (-y + pY0) / canvasScale ;
}

/**
 * Transforms a cartesian x coordinate to the corresponding pixel x coordinate.
 *
 * @param x {number} The cartesian x coordinate.
 *
 * @returns {number} The pixel x coordinate.
 */
function transformCxToPx(x) {
	return pX0 + x * canvasScale;
}

/**
 * Transforms a cartesian y coordinate to the corresponding pixel y coordinate.
 *
 * @param y {number} The cartesian y coordinate.
 *
 * @returns {number} The pixel y coordinate.
 */
function transformCyToPy(y) {
	return pY0 - y * canvasScale;
}

/* Border Getters */

/**
 * @returns {number} The cartesian x coordinate of the canvas's left border.
 */
function getLeftBorderX() {
	return -cX0;
}

/**
 * @returns {number} The cartesian x coordinate of the canvas's right border.
 */
function getRightBorderX() {
	return canvasPW / canvasScale - cX0;
}

/**
 * @returns {number} The cartesian y coordinate of the canvas's top border.
 */
function getTopBorderY() {
	return canvasPH / canvasScale - cY0;
}

/**
 * @returns {number} The cartesian y coordinate of the canvas's bottom border.
 */
function getBottomBorderY() {
	return -cY0;
}