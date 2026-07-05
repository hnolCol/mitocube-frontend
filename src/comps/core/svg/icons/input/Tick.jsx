import InputIconBase from "./Base";

import _ from "lodash"

export function TickIcon({ width = 10, height = 10 }) {
    const halfWidth = width / 2 
    const halfHeight = height / 2

    // const ps = [[margin, halfHeight],[halfWidth,halfHeight+height/3],[width - halfWidth/2, margin]]
    return (
        <InputIconBase {...{ width, height }}>
            <circle cx={halfWidth} cy={halfHeight} fill="darkgrey" r={_.min([width, height]) / 2.5} />
            {/* <polyline points={_.join(_.map(ps, p => `${p[0]},${p[1]}`), " ")} stroke="blue" strokeWidth={2} fill="none"/> */}

        </InputIconBase>
    )
}