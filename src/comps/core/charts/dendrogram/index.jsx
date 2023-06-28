
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { LinePath} from '@visx/shape'
import { useMemo } from 'react';
import * as allCurves from '@visx/curve';
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from '../../../../services/arrays/boundaries';
import { AxisBottom, AxisLeft } from '@visx/axis';
import _ from "lodash"
import { getColorPalette } from '../../colors/colorPalette';
import { SVG } from '../SVGHeader';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { Cluster, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode, HierarchyPointLink } from '@visx/hierarchy/lib/types';
import { LinkVertical } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';

const citrus = '#ddf163';
const white = '#ffffff';
export const green = '#79d259';
const aqua = '#37ac8c';
const merlinsbeard = '#f7f7f3';
export const background = '#306c90';


function RootNode({ node }){
    const width = 40;
    const height = 20;
    const centerX = -width / 2;
    const centerY = -height / 2;
  
    return (
        <Group top={node.y} left={node.x}>
            <LinkVertical />
        <rect width={width} height={height} y={centerY} x={centerX} fill="url('#top')" />
        <text
          dy=".33em"
          fontSize={9}
          fontFamily="Arial"
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
          fill={background}
        >
          {node.data.name}
        </text>
      </Group>
    );
  }
  
  function Node({ node }){
    const isRoot = node.depth === 0;
    const isParent = !!node.children;
  
    if (isRoot) return <RootNode node={node} />;
  
    return (
      <Group top={node.y} left={node.x}>
        {node.depth !== 0 && (
          <circle
            r={12}
            fill={background}
            stroke={isParent ? white : citrus}
            onClick={() => {
              alert(`clicked: ${JSON.stringify(node.data.name)}`);
            }}
          />
        )}
        <text
          dy=".33em"
          fontSize={9}
          fontFamily="Arial"
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
          fill={isParent ? white : citrus}
        >
          {node.data.name}
        </text>
      </Group>
    );
  }
  
  const defaultMargin = { top: 40, left: 0, right: 0, bottom: 40 };
  
function Example({ clusterData, width, height, margin = defaultMargin }) {
    const data = useMemo(() => hierarchy(clusterData), []);
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;
  
    return width < 10 ? null : (
      <svg width={width} height={height}>
        <LinearGradient id="top" from={green} to={aqua} />
        <rect width={width} height={height} rx={14} fill={background} />
        <Cluster root={data} size={[xMax, yMax]}>
          {(cluster) => (
            <Group top={margin.top} left={margin.left}>
              {cluster.links().map((link, i) => (
                <LinkVertical
                  key={`cluster-link-${i}`}
                  data={link}
                  stroke={merlinsbeard}
                  strokeWidth="1"
                  strokeOpacity={0.2}
                  fill="none"
                />
              ))}
              {cluster.descendants().map((node, i) => (
                <Node key={`cluster-node-${i}`} node={node} />
              ))}
            </Group>
          )}
        </Cluster>
      </svg>
    );
  }


export default function  Dendrogram({
    width = 400,
    height = 300,
    margins = {
        left: 50,
        right: 15,
        bottom: 40,
        top: 10
    },
    data = [[{ x: 1, y: 2, z: 2, m: 15 }, { x: 2, y: 4, z: 15, m: 5 }], [{ x: 4, y: 1, z: 30, m: 9 }, { x: 7, y: 1, z: 30, m: 9 }]],
    xaxisName = "x",
    yaxisName = "y",
    curveType = "curveNatural",
    showPoints = true,
    circleRadius = 5,
    strokeWidth = 2,
    circleStrokeWidth = 0.3,
    highlightedYAxisName = undefined,
    showGrid = false,
    svgID = undefined }) {
    const flattenData = _.flatten(data)
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    // const lineHighlighted = highlightedYAxisName !== undefined && yaxisNames.includes(highlightedYAxisName)
    // const sortedyaxisNames = lineHighlighted ? _.concat(yaxisNames.filter(yaxisName => yaxisName !== highlightedYAxisName), [highlightedYAxisName]) : yaxisNames //resort names to have highlighted line on top (e.g. last)
    
    const xScale = useMemo(() => {
  
        const xDomain = getBoundariesFromArrayOfObjects({ data : flattenData, keyName: xaxisName })
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })
       
        return scaleLinear(
            {
                domain: [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, width])

    const yScale = useMemo(() => {
        const yDomain = getBoundariesFromArrayOfObjects({ data : flattenData, keyName: yaxisName })
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain })
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, height])
    
    // const colorScale = useMemo(() => {
    //     return (
    //         scaleOrdinal(
    //             {
    //                 domain: yaxisNames,
    //                 range: getColorPalette(yaxisNames.length)
    //             }
    //         )
    //     )
    // }, yaxisNames)

    if (width < 10) return null
    return (

            <SVG height={height} width={width} svgID={svgID}>
                <rect x="0" y="0" width={width} height={height} fill="#efefef" />
                <AxisLeft scale={yScale} left={margins.left} label={yaxisName} labelOffset={30} numTicks={8} />
                <AxisBottom scale={xScale} top={margins.top + chartHeight} label={xaxisName} numTicks={8} />
            {showGrid ? <g>
                <GridRows scale={yScale} stroke="black" width={chartWidth} numTicks={16} left={margins.left} strokeWidth={0.1} />
                <GridColumns scale={xScale} stroke="black" height={chartHeight} numTicks={16} top={margins.top} strokeWidth={0.1} />
            </g> : null}
                {
                    data.map((lineData, lineIdx) => {
                        
                        // const yaxisColor = lineHighlighted && yaxisName === highlightedYAxisName ? colorScale(yaxisName) : !lineHighlighted ? colorScale(yaxisName) : "darkgrey"
                        return (
                            <g key={`${yaxisName}-${lineIdx}`}>
                            
                                <LinePath
                                    data={lineData}
                                    x={(d) => xScale(d[xaxisName])}
                                    y={(d) => yScale(d[yaxisName])}
                                    stroke={"black"}
                                    fill="none"
                                    curve={allCurves["linearCurve"]}
                                    //curve={allCurves[curveType]}
                                    shapeRendering="geometricPrecision"
                                    {...{ strokeWidth }} />
                            
                            </g>
                        )
                    })
                }
            
            

            </SVG>
    )
}

// export default Dendrogram
