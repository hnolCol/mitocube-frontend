import _ from "lodash"

// muted (non-bright) colors for the plate color trait values of the storage attribute att_plate_color
const PLATE_COLOR_HEX = {
    black: "#525358",
    blue: "#7d9cc4",
    green: "#8fb99b",
    yellow: "#d9cd7a",
    purple: "#a595c4",
    red: "#cf9090",
    clear: "#eef3f6",
    white: "#f2f4f5",
}

/**
 * @description Small muted color indicator for the plate color of a plate (nothing is rendered if the
 * plate has no or an unknown color). Colors are desaturated so they don't light up the interface.
 * @param {Object} props
 * @param {String} props.color The plate color trait text, e.g. "Black".
 * @param {Number} [props.size=14] Diameter of the dot in px.
 * @param {Object} [props.style] Additional inline styles.
 */
export function PlateColorDot({ color, size = 14, style }) {
    const key = _.toLower(_.trim(color || ""))
    if (!key) return null
    const hex = PLATE_COLOR_HEX[key]
    if (!hex) return null
    const isClear = key === "clear"
    return (
        <span
            title={`Plate color: ${_.trim(color)}`}
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                display: "inline-block",
                flexShrink: 0,
                verticalAlign: "middle",
                backgroundColor: hex,
                border: `1px solid ${isClear ? "#9db2be" : hex}`,
                borderStyle: isClear ? "dashed" : "solid",
                opacity: 0.85,
                ...style,
            }}
        />
    )
}
