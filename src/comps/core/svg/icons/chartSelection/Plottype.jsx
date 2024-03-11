

import { getColorPalette } from "../../../colors/colorPalette"
import _ from "lodash"
import IconBase from "./Base"
import Box from "../../../charts/boxplot/cached_box"

function PlottypeIcon({ height, placeholder = "", items = [{ text: "Menu1" }], plotType = "barplot", colorIdx = 0, callbackKey = undefined, callback = undefined,callbackValueOnly = false}) {
    
    const colorPalette = getColorPalette(4)
    const barWidth = 4
    return (
        <IconBase {...{height,placeholder,items,callback,callbackKey,callbackValueOnly}}>
            {plotType === "barplot"?[{ height: 3 }, { height: 14 }, { height: 8 }, { height: 12 }, { height: 1 }, { height: 4 }].map((rectProps, idx) =>
                <rect key={`normr-${idx}`} {...rectProps} x={2 + idx * barWidth} y={15 - rectProps.height} height={rectProps.height} width={barWidth}
                    fill={colorPalette[idx]} stroke="none" />) : null}
            {plotType === "boxplot" ? [
                { min: 15, q25: 13, median: 8, q75: 6, max: 2 },
                { min: 16, q25: 12, median: 5, q75: 3, max: 2 },
                { min: 14, q25: 12, median: 8, q75: 6, max: 1 }].map((boxplotProps, idx) => {
                    return (
                        <Box key={`${idx}-plotType-box`}{...boxplotProps} width = {7} x={5 + 10*idx}  fill={colorPalette[idx]} strokeWidth={0.5}/>
                )
                }) : null}
            {plotType === "lineplot"?[{ cy: 3 }, { cy: 14 }, { cy: 8 }, { cy: 13 }].map((pointProps, idx) => {
                return <circle key={`normr-line${idx}`} {...pointProps} cx={10 + idx * barWidth} {...pointProps} r={3}
                    fill={colorPalette[idx]} stroke="none" />}) : null}
        </IconBase>
    )
}

export default PlottypeIcon