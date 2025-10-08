
// move this to services!! 

const STD_CHART_COLOR_PALETTE = [
    "#466688",
    "#79c29e",
    "#e7ad00",
    "#b62444",
    "#c5959d",
    "#297d37",
    "#b2b2b2",
    "#d97a4b"
    ]

export function getColorPalette(n) {
    return STD_CHART_COLOR_PALETTE.slice(0,n)
}

export function getRedBlueColorScale() {
    return ["#466688","#ffffff","#a82331"]
}

export const STROKE_COLOR = "#000000" 
export const HIGHLIGHT_COLOR = "#466688" // this is the color used for highlighting elements in the UI, like selected items or important notifications
/**
 * @description Function to be used to get the axis color. Currently does not implement any checks when it should change, but it is intended to be used for example in darkmode conditions. 
 * @returns {String} The hex color code for the stroke color of an axis. 
 */
export function getAxisStrokeColor(){
    return "#000000"
}


