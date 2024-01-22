import _ from "lodash"
import React, { useMemo } from "react"
/**
 * 
 * @param {Object} props 
 * @param {Object.<string, import("../../../../types/calculations").QuantileResult>} props.data 
 * @param {String[]} props.keyNames 
 * @param {Boolean} props.showMedianPoints
 * @returns 
 */

function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (!_.isArray(prevProps.rerenderDependency)) return false
    if (prevProps.rerenderDependency.length !== nextProps.rerenderDependency.length) return false 
    if (_.some(prevProps.rerenderDependency, (value,idx) => nextProps.rerenderDependency[idx] !== value)) return false 
    return true
  }

const QuantileBackground = React.memo(
    function QuantileBackground({ data, keyNames, xScale, yScale, showMedianPoints = false, rerenderDependency = [] }) {
        const reversedKeyNames = Array.from(keyNames).reverse()
        
        const getBackgroundLines = () => {

            const halfBandwidth = xScale.bandwidth() / 2        
            const q25 = _.map(keyNames, keyName => {
                const qs = data[keyName]
                return (`${xScale(keyName)+halfBandwidth},${yScale(qs.values[0])}`)
            }) 
            const q75 = _.map(reversedKeyNames, keyName => {
                const qs = data[keyName]
                return (`${xScale(keyName)+halfBandwidth},${yScale(qs.values[2])}`)
            })

            const median = _.map(keyNames, keyName => {
                const qs = data[keyName]
                return (`${xScale(keyName)+halfBandwidth},${yScale(qs.values[1])}`)
            })

            const medianPointCoords = _.map(keyNames, keyName => {
                const qs = data[keyName]
                return { cx: xScale(keyName) + halfBandwidth, cy: yScale(qs.values[1]), r: 5, fill: "white", stroke: "#000", key: `${keyName}-median-circle` }
            })

            return { quantileBackgroundPoints: _.join(_.concat(q25, q75, q25[0]), ", "), medianLinePoints: _.join(median, ", "), medianPointCoords}
        }
        
        const {quantileBackgroundPoints, medianLinePoints, medianPointCoords } = useMemo(() => getBackgroundLines(), [keyNames,xScale,yScale])
        return (
        <g>
                {/* Background of 25 and 75% quantile. */}
                {_.isString(quantileBackgroundPoints) ? <polyline points={quantileBackgroundPoints} stroke="#000" fill="#efefef" strokeWidth={0.2} /> : null}
                {/* Median Line */}
                {_.isString(medianLinePoints) ? <polyline points={medianLinePoints} stroke="#000" strokeWidth={1} fill="none" strokeDasharray={"4"}/> : null}
                {showMedianPoints && _.isArray(medianPointCoords) ? medianPointCoords.map(circleProps => <circle {...circleProps}/>) : null}
                </g>
        )

    }, areEqual ) 


    export {QuantileBackground}

