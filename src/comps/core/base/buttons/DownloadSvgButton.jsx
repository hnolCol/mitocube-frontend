import { downloadSVG } from "@/services/downloads/svg"

/**
 * @param {Object} props
 * @param {Object} props.chartRef Ref whose current element contains the chart <svg>.
 * @param {String} props.fileName File name for the downloaded .svg file.
 * @param {String} props.text Button label.
 */
export function DownloadSvgButton({ chartRef, fileName = "chart.svg", text = "SVG" }) {
    return <button
        className="basic-button--small"
        onClick={() => {
            const svg = chartRef?.current?.querySelector("svg")
            if (svg) downloadSVG(svg, fileName)
        }}
    >
        {text}
    </button>
}
