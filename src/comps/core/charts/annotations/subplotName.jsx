import { Text } from "@visx/text"

const locFuncs = {
    topright: (w, h, m, d) => { return { x: w + m.left, y: m.top, dx: -d, dy:d } },
    topleft: (w, h, m, d) => { return { x: m.left, y: m.top, dx : d, dy : d } },
    centerleft: (w, h, m, d) => { return { x: m.left, y: h / 2 + m.top, dx : d} },
    centerright: (w, h, m, d) => { return { x: w + m.left, y: h / 2 + m.top, dx : -d } },
    bottomright: (w, h, m, d) => { return { x: w + m.left, y: h + m.top, dx: -d, dy: -d } },
    bottomleft: (w, h, m, d) => { return { x: m.left, y: h + m.top, dx: d, dy: -d } },
    topcenter : (w, h, m, d) => { return { x: m.left + w/2, y: m.top, dy: d } }
}

const locProps = {
    topright: { verticalAnchor: "start", textAnchor: "end" },
    topleft: { verticalAnchor: "start", textAnchor: "start" },
    centerleft: { verticalAnchor: "middle", textAnchor: "start" },
    centerright: { verticalAnchor: "middle", textAnchor: "end" },
    bottomright: { verticalAnchor: "end", textAnchor: "end" },
    bottomleft: { verticalAnchor: "end", textAnchor: "start" },
    topcenter : { verticalAnchor: "start", textAnchor: "middle" }
}

function SubplotName({ text = "", loc = "topright", chartWidth = 200, chartHeight = 200, margins = {left : 5, top : 5}, delta = 2}) {
    
    if (loc in locProps) return (<Text {...locFuncs[loc](chartWidth,chartHeight,margins, delta)} {...locProps[loc]}>{text}</Text>)
    
}

export default SubplotName