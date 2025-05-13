/**
 * Returns 1, 0 or -1 depending on whether the input value is positive, 0 or negative.
 *
 * @param value {number} The input value.
 * @param [min] {number} If the absolute value of the input value is smaller than this value, 0 will be returned.
 *
 * @returns {number} 1, 0 or -1 depending on whether the input value is positive, 0 or negative.
 *
 * @author Tizian Kirchner
 */
function sign(value, min) {
    if(min === undefined) {
        min = 0;
    }

    if(value === 0 || abs(value) < min) {
        return 0;
    } else if(value > 0) {
        return 1;
    } else {
        return -1;
    }
}