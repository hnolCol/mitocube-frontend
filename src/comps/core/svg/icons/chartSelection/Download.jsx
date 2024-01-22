import _ from "lodash"
import ComboboxIconBase from "./ComboboxBase"

function DownloadIcon({ height = 25, width = 25, placeholder = "", items = [{ text: "Menu1" }], callbackKey = undefined, callback = undefined,callbackValueOnly = false, minimal = true}) {
    
    const arrowWidth = width / 5
    const halfWidth = width / 2
    const arrowEnd = height / 1.5
    const arrowHeight = height/5

    return (
        <ComboboxIconBase {...{width, height, placeholder, items, callback, callbackKey, callbackValueOnly, minimal, filterable : false}}>
            <g>
                <line x1={width/2} x2={width/2} y1={height/5} y2={arrowEnd} strokeWidth={1.5} stroke={"#000"} />
                <polyline points={`${halfWidth - arrowWidth},${arrowEnd - arrowHeight} ${halfWidth},${arrowEnd} ${halfWidth + arrowWidth},${arrowEnd - arrowHeight}`}
                    strokeWidth={1.5}
                    stroke={"#000"} fill="none" />
            </g>
        </ComboboxIconBase>
    )
}

export default DownloadIcon