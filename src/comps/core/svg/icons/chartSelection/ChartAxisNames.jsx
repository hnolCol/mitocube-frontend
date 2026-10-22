import ComboboxIconBase from "./ComboboxBase"

/**
 * @description X-axis selection icon. Opens a dropdown to select the key name plotted on the x-axis.
 * @param {String[]} props.items - The selectable key names
 * @param {String} props.placeholder - The currently selected key name (shown when minimal is false)
 * @param {String[]} props.selectedItems - The selected key names
 * @param {String} props.callbackKey - The key passed to the callback (e.g. "xaxisName")
 * @param {Function} props.callback - Called as callback(callbackKey, value)
 * @param {Boolean} props.minimal - If true the placeholder text is hidden
 * @param {Boolean} props.itemIsAttribute - If true items are fetched as attribute tags from the backend
 */
export function XAxisName({ height = 25, width = 25, margin = 7, ...props }) {
    const iconHeight = height - margin
    return (
        <ComboboxIconBase {...{ height, width, ...props }}>
            {[
                { x1: margin, x2: iconHeight, y1: margin, y2: iconHeight },
                { x1: margin, x2: iconHeight, y1: iconHeight, y2: margin }
            ].map((lineProps, lineIdx) => <line key={`X-axisLine${lineIdx}`} {...lineProps} stroke="black" strokeWidth={1} />)}
        </ComboboxIconBase>
    )
}

/**
 * @description Y-axis selection icon. Opens a dropdown to select the key name plotted on the y-axis.
 * @param {String[]} props.items - The selectable key names
 * @param {String} props.placeholder - The currently selected key name (shown when minimal is false)
 * @param {String[]} props.selectedItems - The selected key names
 * @param {String} props.callbackKey - The key passed to the callback (e.g. "yaxisName")
 * @param {Function} props.callback - Called as callback(callbackKey, value)
 * @param {Boolean} props.minimal - If true the placeholder text is hidden
 * @param {Boolean} props.itemIsAttribute - If true items are fetched as attribute tags from the backend
 */
export function YAxisName({ height = 25, width = 25, margin = 7, ...props }) {
    const iconHeight = height - margin
    const middleX = height / 2
    const splitCenter = iconHeight / 1.4
    return (
        <ComboboxIconBase {...{ height, width, ...props }}>
            {[
                { x1: middleX, x2: middleX, y1: iconHeight, y2: splitCenter },
                { x1: middleX, x2: middleX - middleX / 2, y1: splitCenter, y2: margin },
                { x1: middleX, x2: middleX + middleX / 2, y1: splitCenter, y2: margin }
            ].map((lineProps, lineIdx) => <line key={`Y-axisLine${lineIdx}`} {...lineProps} stroke="black" strokeWidth={1} />)}
        </ComboboxIconBase>
    )
}
