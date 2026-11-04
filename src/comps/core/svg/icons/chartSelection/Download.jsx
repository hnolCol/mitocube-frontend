import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Download icon. Opens a dropdown to select the elements to download.
 */
function DownloadIcon({ height = 25, width = 25, ...props }) {
    const arrowWidth = width / 5
    const halfWidth = width / 2
    const arrowStart = height / 5
    const arrowEnd = height - height / 5
    const arrowHeight = height / 5
    return (
        <ComboboxIconBase {...{ height, width, filterable: false, itemIsAttribute: false, ...props }}>
            <g>
                <line x1={halfWidth} x2={halfWidth} y1={arrowStart} y2={arrowEnd} strokeWidth={1.5} stroke={"#000"} />
                <polyline points={`${halfWidth - arrowWidth},${arrowEnd - arrowHeight} ${halfWidth},${arrowEnd} ${halfWidth + arrowWidth},${arrowEnd - arrowHeight}`}
                    strokeWidth={1.5}
                    stroke={"#000"} fill="none" />
            </g>
        </ComboboxIconBase>
    )
}

export default DownloadIcon
