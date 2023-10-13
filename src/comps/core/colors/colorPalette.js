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


export function getAxisStrokeColor(){
    return "#000000"
}


