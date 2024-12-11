/**
 * @description Checks if a string  matches the hex color string style. Does *not* support
 * the transparent format. 
 * @param {string} colorString The color string to be checked.
 * @returns 
 */
export function isHex(colorString) {
    return /^#[0-9A-F]{6}$/i.test(colorString)
}


/**
 * Checks if a hex color is light. Can be used to determine if the font color should
 * rather be black or white.  
 * @param   {string}    colorString   The hexcolor
 * @return   {Boolean}    If the color is light.
 */
export function isHexColorLight(colorString) {
    const hex = colorString.replace('#', '');
    const c_r = parseInt(hex.substring(0, 2), 16);
    const c_g = parseInt(hex.substring(2, 4), 16);
    const c_b = parseInt(hex.substring(4, 6), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 155;
}
