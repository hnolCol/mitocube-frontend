import _ from "lodash"

// muted (non-bright) colors for plate color trait values
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
 * @description Returns the color trait text of a plate, resolved from its applications (attributes
 * of the storage attribute group that describe it). The trait text is only returned when it is a
 * know color word, otherwise null, so no color word has to be hard coded to an attribute tag.
 * @param {Object} plate A plate with an applications array (attribute_text, trait_text).
 * @returns {?String} The plate color trait text, e.g. "Black", or null.
 */
export function getPlateColor(plate) {
    const application = (plate?.applications || []).find(app => PLATE_COLOR_HEX[_.toLower(_.trim(app.trait_text || ""))])
    return application?.trait_text || null
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
