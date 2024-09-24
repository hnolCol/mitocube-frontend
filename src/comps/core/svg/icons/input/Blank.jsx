import InputIconBase from "./Base";

import _ from "lodash"

export function BlankIcon({ width = 10, height = 10 }) {
    

    return (
        <InputIconBase {...{ width, height }}>
            {/* <circle cx={halfWidth} cy={halfHeight} fill="green" r={_.min([width, height]) / 2.5} /> */}
            {/* <polyline points={_.join(_.map(ps, p => `${p[0]},${p[1]}`), " ")} stroke="blue" strokeWidth={2} fill="none"/> */}

        </InputIconBase>
    )
}