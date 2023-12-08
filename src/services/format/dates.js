
/**
 * Transforms milliseconds into days
 * @param   {number}    milliseconds   - The millicsecond value.
 * @return  {number}     The amount of days. 
 */
export function millisecondsToDays(milliseconds) {
    return Math.ceil(milliseconds / (1000 * 3600 * 24));
}



