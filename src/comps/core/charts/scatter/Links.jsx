
import React from "react"
import _ from "lodash"





/**
 * @description Checks if the legend should rerender. basically only a change in colorName or sizeName causes a rerender. 
 * This might be important if the list of items is long.
 * @param {Object} prevProps 
 * @param {*} nextProps 
 * @returns 
 */
function areEqual(prevProps, nextProps) {
    if (!_.isArray(prevProps.rerenderDependency)) return false
    if (prevProps.rerenderDependency.length !== nextProps.rerenderDependency.length) return false
    if (_.some(prevProps.rerenderDependency, (value, idx) => nextProps.rerenderDependency[idx] !== value)) return false
    return true
}



  const NetworkLinks = React.memo(function NetworkLinks({linkIdcs,nodes,xScale,yScale}) {

    return (
    <g>
            {linkIdcs.map(linkIdc => {
                const source = nodes[linkIdc[0]]
                const target = nodes[linkIdc[1]]
              if (!_.isObject(source) || !_.isObject(target)) {
                return null
              }
              return <line key={`${linkIdc[0]}-${linkIdc[1]}`} x1={xScale(source.x)} x2={xScale(target.x)} y1={yScale(source.y)} y2={yScale(target.y)} stroke="#878787" strokeWidth={0.5} strokeOpacity={0.8}/>

        })}
    </g>
    )
}, areEqual

  )


export {NetworkLinks}
