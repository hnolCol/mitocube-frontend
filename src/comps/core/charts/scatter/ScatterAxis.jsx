import { AxisBottom, AxisLeft } from "@visx/axis";



function ScatterAxis({xScale, yScale}){

    return(
        <g>
        <AxisLeft scale={yScale} />
        <AxisBottom scale={xScale} />
        </g>
    )
}