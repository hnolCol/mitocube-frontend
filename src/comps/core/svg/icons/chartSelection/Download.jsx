import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Download icon. Opens a dropdown to select the elements to download.
 */
function DownloadIcon({ height = 25, width = 25, ...props }) {
    const arrowWidth = width * 0.18
    const halfWidth = width / 2
    const arrowStart = height * 0.22
    const arrowEnd = height * 0.62
    const arrowHeight = height * 0.18
    const trayY = height * 0.78
    return (
        <ComboboxIconBase {...{ height, width, filterable: false, itemIsAttribute: false, ...props }}>
            <g>
                <line x1={halfWidth} x2={halfWidth} y1={arrowStart} y2={arrowEnd} strokeWidth={1.5} stroke={"#000"} />
                <polyline points={`${halfWidth - arrowWidth},${arrowEnd - arrowHeight} ${halfWidth},${arrowEnd} ${halfWidth + arrowWidth},${arrowEnd - arrowHeight}`}
                    strokeWidth={1.5}
                    stroke={"#000"} fill="none" />
                <polyline points={`${width * 0.28},${trayY} ${width * 0.28},${trayY} ${width * 0.72},${trayY}`}
                    strokeWidth={1.5} strokeLinecap="round" stroke={"#000"} fill="none" />
            </g>
        </ComboboxIconBase>
    )
}

export default DownloadIcon
