
import PropTypes from "prop-types"
import { SVG } from "../SVGHeader"
import { useMemo } from "react";
import { scaleLinear } from "@visx/scale";
import { getBoundariesFromArrayOfObjects } from "../../../../services/arrays/boundaries";
import _ from "lodash"
import { Group } from "@visx/group";
import { GridAngle, GridRadial } from "@visx/grid";
import { AxisLeft } from "@visx/axis";
import { LinearGradient } from "@visx/gradient";
import { LinePath, LineRadial } from "@visx/shape";
import { curveBasisOpen } from '@visx/curve';

const green = '#e5fd3d';
export const blue = '#aeeef8';
const darkgreen = '#dff84d';
export const background = '#744cca';
const darkbackground = '#603FA8';
const strokeColor = '#744cca';
RadialCategoricalScatter.propTypes = {

}

function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}


const data = _.range(15).map((v,ii) => {
    return { y : _.random(0,25,true), x: ii,  L :  randomChoice(["MIM","MOM","Matrix"])} //
})

function RadialCategoricalScatter({
    width = 800,
    height = 800,
    margins = {
        left: 5,
        top: 5,
        right: 5,
        bottom: 5
    },
    yaxisName = "y",
    colorName = "L",
    strokeColor = "#000000",
    svgID = undefined,
    svgRef = undefined
}) {
    const padding = 20

    const xScale = useMemo(() => {
        return scaleLinear({
            range: [0, Math.PI * 2],
            domain : [0,data.length]
        })
    }, [data.length])

    const yScale = useMemo(() => {
        const bounds = getBoundariesFromArrayOfObjects({ data, keyName: yaxisName })
        return scaleLinear({
            domain: [0, 35],
            range : [0, height/2-padding]
        })
    }, [])
    const angle = (d) => xScale(d.x) ?? 0;
    const radius = (d) => yScale(d.y) ?? 0;
    const reverseYScale = yScale.copy().range(yScale.range().reverse());

    return (

        <SVG {...{ svgID, svgRef, width, height }}>
            <LinearGradient from={green} to={blue} id="line-gradient" />
                <rect width={width} height={height} fill={background} rx={14} />
        <Group top={height / 2} left={width / 2}>
          <GridAngle
            scale={xScale}
            outerRadius={height / 2 - padding}
            stroke={green}
            strokeWidth={1}
            strokeOpacity={0.3}
            strokeDasharray="5,2"
                    numTicks={22}
                    offset={0}
          />
          <GridRadial
            scale={yScale}
            numTicks={5}
            stroke={blue}
            strokeWidth={1}
            fill={"white"}
            fillOpacity={0.1}
            strokeOpacity={0.2}
          />
          <AxisLeft
            top={-height / 2 + padding}
            scale={reverseYScale}
            numTicks={5}
            tickStroke="none"
            tickLabelProps={{
              fontSize: 8,
              fill: "black",
              fillOpacity: 1,
              textAnchor: 'middle',
              dx: '1em',
              dy: '-0.5em',
              stroke: strokeColor,
              strokeWidth: 0.5,
              paintOrder: 'stroke',
            }}
            hideAxisLine={true}
          />
        <LineRadial angle={angle} radius={radius} curve={curveBasisOpen["linear"]}>
                    {({ path }) => {
                        const d = path(data) || '';
                        return (
                            <path
                                d={d}
                                stroke="black"
                                strokeWidth={2}
                                strokeOpacity={0.8}
                                strokeLinecap="round"
                                fill="none"/>)
                    }
                    }

          </LineRadial>
                {data.map((d, i) => {
                    const phi = angle(d ) - Math.PI/2
                    const r = radius(d)
                    const cx = r * Math.cos( phi )
                    const cy = r * Math.sin(phi)
                    return (
                        <circle key={`${i}-circle`} {...{cx,cy,r : 5}} fill="white"/>
                    )
                })}

          
        </Group>

        </SVG>
        
    )
}


export default RadialCategoricalScatter