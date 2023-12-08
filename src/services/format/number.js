
var SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];


/**
 * Returns a number into SI_Symbol abbreviations. 5000 is converted to 5k. Only works for high numbers at the moment. (e.g. k, M, G, T, P, E)
 * @param   {number}    number  - The number to transform to string.
 * @return  {string}     The abbreviated number as a string. 
 */
export function abbreviateNumber(number){

    // what tier? (determines SI symbol)
    var tier = Math.log10(Math.abs(number)) / 3 | 0;

    // if zero, we don't need a suffix
    if(tier == 0) return number;

    // get suffix and determine scale
    var suffix = SI_SYMBOL[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(1) + suffix;
}
