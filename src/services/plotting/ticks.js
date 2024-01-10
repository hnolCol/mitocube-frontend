
/**
 * @description Calculates the number of ticks to be displayed based on the given space.
 * @param {Number} space 
 * @returns {Number} The number of ticks for a certain space.
 */
export function getNumberTicks(space = 400) {
    // returns the number of ticks dependning on the space available 
    // usefull to have a repsonsive layout for changing width and height in a chart.
    if (space > 600) return 7
    
    if (space > 400) return 5 

    if (space > 300) return 4

    return 4

}