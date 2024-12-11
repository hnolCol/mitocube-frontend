import PropType from 'prop-types'
import { memo } from 'react'
import _ from "lodash"
import { areAllValuesNumbers } from "../../../../services/arrays/checks"
import { isPropHexColorString } from '../../types/checks/color'
import { Text } from '@visx/text'
import { abbreviateNumber } from '../../../../services/format/number'

/**
 * @description Plots a vertical box with whiskers as part of a boxplot. Uses memorization to avoid rerenderings. All coordinates must be
 * given in pixels and *not* real numbers.
 * @param {Object} props
 * @param {Number} props.x The center x position of the box. 
 * @param {Number} props.width The width of the box in pixel. Often from scale.bandwidth()
 * @param {Number} props.min The min y-coordinate
 * @param {Number} props.max The max y-coordinate 
 * @param {Number} props.q25 The 25% quantile coordinate
 * @param {Number} props.q75 The 75% quantile coordinate
 * @param {String} props.fill The fill color of the box. Must be in hex format. 
 * @param {String} props.stroke The stroke color in hex code. 
 * @param {Number} props.strokeWidth The width of the stroke around the box and of the min/max whiskers. 
 * @param {Number} props.opacity The opacity of the box, fill does not expect hex colors with alpha. 
 * @param {Boolean} props.showWhiskers If whiskers should be shown. 
 * @param {Number} props.whiskerScale The fraction of the box with that is used for the whiskers. 
 * @returns 
 */
function Box({ x,
    width,
    median,
    min,
    max,
    q25,
    q75,
    fill,
    stroke,
    strokeWidth,
    showWhiskers,
    opacity,
    whiskerScale,
    N}) {
    // provide box coordinates in pixel 
    const whishkerWidth = width * whiskerScale
    const halfWidth = width / 2

    if (!areAllValuesNumbers([x, width, median, min, max, q25, q75])) return null
    return (
        <g {...{opacity}}>
            <rect x={x - halfWidth} y={q75} height={q25 - q75} {...{ width, fill, stroke, strokeWidth }} />
            {/* Min-Max Lines */}
            {[{ y1: min, y2: q25 }, { y1: max, y2: q75 }].map(((lineCoords, lineIdx) => {
                return (
                    <line key={`minMaxBox-${lineIdx}`} x1={x} x2={x} {...{ stroke, strokeWidth }} {...lineCoords} />
                )
            }))}
            {/* Whiskers */}
            {showWhiskers?[
                { y1: min, y2: min, x1: x - whishkerWidth / 2, x2: x + whishkerWidth / 2 },
                { y1: max, y2: max, x1: x - whishkerWidth / 2, x2: x + whishkerWidth / 2 }].map(((lineCoords, lineIdx) => {
                return (
                    <line key={`whiskerBox-${lineIdx}`} x1={x} x2={x} {...{ stroke, strokeWidth }} {...lineCoords} />
                )
                })) : null}
            {/* Median Line Gets a 1.2 strokewidth by default*/}
            <line x1={x - halfWidth} x2={x + halfWidth} y1={median} y2={median} {...{ stroke, strokeWidth: strokeWidth * 1.2 }} />
            {_.isNumber(N) ? <Text x={x} y={max - halfWidth / 2} verticalAnchor='center' textAnchor='middle' fontSize={9}>{abbreviateNumber(N)}</Text> : null}
            
        </g>
    )
}


function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    const prevPropsSum = prevProps.x + prevProps.q25 + prevProps.q75 + prevProps.width + prevProps.min + prevProps.max + prevProps.median
    const nextPropsSum = nextProps.x + nextProps.q25 + nextProps.q75 + nextProps.width + nextProps.min + nextProps.max + nextProps.median
    
    if (prevPropsSum !== nextPropsSum) return false 
    if (prevProps.opacity!== nextProps.opacity) return false
    if (prevProps.fill !== nextProps.fill) return false
    if (prevProps.showWhiskers!== nextProps.showWhiskers) return false
    return true

  }
  
Box.defaultProps = {
    fill: "#efefef",
    stroke: "#000000",
    strokeWidth: 0.5,
    showWhiskers: true,
    opacity: 1,
    whiskerScale: 0.5
}


Box.propTypes = {
    x: PropType.number.isRequired,
    width: PropType.number.isRequired,
    median: PropType.number.isRequired,
    min: PropType.number.isRequired,
    max: PropType.number.isRequired,
    q25: PropType.number.isRequired,
    q75: PropType.number.isRequired,
    fill: isPropHexColorString,
    stroke: isPropHexColorString,
    strokeWidth: PropType.number,
    showWhiskers: PropType.bool,
    whiskerScale: PropType.number,
    opacity: PropType.number,


}

  export default memo(Box, areEqual);