import ComboboxIconBase from "./ComboboxBase"

/**
 * @description Group-selection icon. Opens a dropdown to select the key name used for grouping.
 * @param {(Boolean|String)} props.hightlightBox - Highlights the left/right box ("left", "right", true or false).
 */
function GroupIconWithName({ height = 25, width = 25, hightlightBox, ...props }) {
    const boxwidth = width / 3
    const boxheight = height / 2
    const horizotalmargin = 2
    return (
        <ComboboxIconBase {...{ height, placeholder: "", selectedItems: [], minimal: true, ...props }}>
            <line x1={horizotalmargin + boxwidth / 2} x2={width - horizotalmargin - boxwidth / 2} y1={height / 2} y2={height / 2} stroke="black" strokeWidth={1} />
            <rect x={horizotalmargin} y={height / 2 - boxheight / 2} fill={hightlightBox === "left" ? "red" : "#fff"} width={boxwidth} height={boxheight} stroke="#000" rx={2} />
            <rect x={width - horizotalmargin - boxwidth} y={height / 2 - boxheight / 2} fill={hightlightBox === "right" ? "red" : "#fff"} width={boxwidth} height={boxheight} stroke="#000" rx={2} />
        </ComboboxIconBase>
    )
}

export default GroupIconWithName
