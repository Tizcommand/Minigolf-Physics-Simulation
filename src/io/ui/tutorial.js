/**
 * Provides variables and a function for drawing tutorial instructions to the canvas.
 * @author Tizian Kirchner
 */

/**
 * While the {@link tutorial} is in this state,
 * the user is instructed on how to launch the {@link ball} off the {@link catapult}.
 *
 * @type {number}
 */
const TUTORIAL_START = 0;

/**
 * While the {@link tutorial} is in this state,
 * the {@link updateTutorial} function waits for {@link ball} to come to a stop.
 *
 * @type {number}
 */
const TUTORIAL_WAIT_BUTTON = 1;

/**
 * While the {@link tutorial} is in this state,
 * the user is instructed on how to use the {@link newButton} and {@link resetButton} buttons.
 *
 * @type {number}
 */
const TUTORIAL_BUTTON = 2;

/**
 * While the {@link tutorial} is in this state,
 * the user is instructed on how the wind works.
 *
 * @type {number}
 */
const TUTORIAL_WIND = 3;

/**
 * The {@link tutorial} set to this state when it has ended.
 *
 * @type {number}
 */
const TUTORIAL_END = 4;

/**
 * The current state of the tutorial.
 *
 * Has to be either {@link TUTORIAL_START}, {@link TUTORIAL_WAIT_BUTTON}, {@link TUTORIAL_BUTTON},
 * {@link TUTORIAL_WIND} or {@link TUTORIAL_END}.
 *
 * @type {number}
 */
let tutorial = TUTORIAL_START;

/**
 * How many seconds the {@link ball}'s velocity has been below 0.05 m/s.
 *
 * Only updated during the {@link TUTORIAL_WAIT_BUTTON} state.
 *
 * @type {number}
 */
let ballLowSpeedTime = 0;

/**
 * Draws various text and animated arrows for the simulation's tutorial.
 *
 * What text and animated arrows are drawn depends on the current state of the tutorial.
 *
 * @param delta How many seconds passed between the current and the last frame.
 *
 * @see tutorial
 */
function updateTutorial(delta) {
    switch (tutorial) {
        case TUTORIAL_START:
            textAlign(LEFT, TOP);
            let x = catapultPosition.x - catapultW / 2 + 0.02;
            let y = catapultPosition.y + 0.7;
            drawAnimatedArrow(x, y, fgCl, 0.35, DIR_BTM);

            x = (lftGround.x + lftGround.w + rgtGround.x) / 2 - 0.07;
            drawAnimatedArrow(x, 0.7, fgCl, 0.35, DIR_BTM);

            let str = "Pull the ball towards the bottom right and try to launch it into the hole to the left.";
            x = catapultPosition.x - catapultW / 2 - 0.75;
            y = catapultPosition.y + 1.2;
            textAlign(LEFT, TOP);
            drawString(str, x, y, fgCl, 0.10, 1.5, 1);

            if(state === STATE_SPRING_RELEASE) {
                tutorial = TUTORIAL_WAIT_BUTTON;
            }
            break;
        case TUTORIAL_WAIT_BUTTON:
            if(state === STATE_THROW) {
                if(ballLowSpeedTime >= 1) {
                    tutorial = TUTORIAL_BUTTON;
                }else if(ball.velocity.mag() < 0.05) {
                    ballLowSpeedTime += delta;
                }else {
                    ballLowSpeedTime = 0;
                }
            }

            if(state === STATE_SPRING_ATTACHED) {
                tutorial = TUTORIAL_WIND;
            }
            break;
        case TUTORIAL_BUTTON:
            textAlign(LEFT, TOP);
            drawAnimatedArrow(newButton.x + newButton.w / 2, newButton.y - 0.7, fgCl, 0.35, DIR_TP);
            drawString(
                "Pressing the NEW TRY button will start a new try " +
                "without resetting your number of tries and successful tries. " +
                "It will randomize the wind if you landed the ball in the hole.",
                newButton.x, newButton.y - 1.4, fgCl, 0.10, newButton.w, 2
            );

            drawAnimatedArrow(resetButton.x + resetButton.w / 2, resetButton.y - 0.7, fgCl, 0.35, DIR_TP);
            drawString(
                "Pressing the RESET button will start a new try " +
                "with resetting your number of tries and successful tries. " +
                "It will always randomize the wind.",
                resetButton.x, resetButton.y - 1.4, fgCl, 0.10, resetButton.w, 2
            );

            if(state === STATE_SPRING_ATTACHED) {
                tutorial = TUTORIAL_WIND;
            }
            break;
        case TUTORIAL_WIND:
            textAlign(LEFT, TOP);
            drawAnimatedArrow(flagpole.x - 0.07, flagpole.y + 0.7, fgCl, 0.35, DIR_BTM);
            drawAnimatedArrow(getLeftBorderX() + 2, getTopBorderY() - 0.2, fgCl, 0.20, DIR_LFT);
            drawString(
                "This flag shows you how strong the wind is and which direction it comes from. " +
                "You can look up the exact wind speed at the top left.",
                flagpole.x - 1, flagpole.y + 1.4, fgCl, 0.10, 2, 1
            );

            if(state === STATE_SPRING_RELEASE) {
                tutorial = TUTORIAL_END;
            }
            break;
    }
}