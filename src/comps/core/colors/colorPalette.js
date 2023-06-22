const STD_CHART_COLOR_PALETTE = [
    "#466688",
    "#79c29e",
    "#e7ad00",
    "#e700d2",
]

export function getColorPalette(n) {
    return STD_CHART_COLOR_PALETTE.slice(0,n)
}

export function getRedBlueColorScale() {
    return ["#466688","#ffffff","#a82331"]
}

export function getAxisStrokeColor(){
    return "#000000"
}


