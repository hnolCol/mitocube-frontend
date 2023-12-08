
/**
 * Checks if a hex color is light. Can be used to determine if the font color should
 * rather be black or white.  
 * @param   {string}    color   The hexcolor
 * @return   {Boolean}    If the color is light.
 */
export function isHexColorLight(color) {
    const hex = color.replace('#', '');
    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    return brightness > 155;
}


export function randomColor() {
    return Math.floor(Math.random()*16777215).toString(16);
}