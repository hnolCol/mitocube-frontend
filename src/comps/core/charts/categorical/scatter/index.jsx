import { scaleLinear, scaleOrdinal} from "@visx/scale";
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects, getDomainWithBoundaries } from "../../../../../services/arrays/boundaries";
import { SVG } from "../../SVG";
import { useMemo } from "react";
import _ from "lodash"
import Point from "../../scatter/Point";
import AxisWithBackground from "../../axis";
import { getColorPalette } from "../../../colors/colorPalette";
import { useTooltip, useTooltipInPortal, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import GroupingTable from "../../../base/groupings/table";
import MetricTable from "../../../base/metrictable";
import SubplotName from "../../annotations/SubplotName";

function CategoricalScatter({
    width = 200,
    height = 200,
    margins = {
        left: 30,
        right: 15,
        bottom: 25,
        top: 5
    },
    data = [],
    title = "",
    sizeRange = [3, 10],
    subplotName, 
    sizeName = "y",
    colorName,
    yaxisName = "y",
    xaxisName, //use index if undefined
    yAxisDomain,
    defaultColor = "#fffff",
    defaultCircleRadius = 8,
    xscale,
    colorscale,
    sizescale,
    svgID,
    svgRef
}) {
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip();
    
      const { containerRef, TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
      })
    
    const chartWidth = width - margins.left - margins.right
    const chartHeight = height - margins.top - margins.bottom
    const uniqueColorValues = useMemo(()=> colorName!==undefined?_.uniq(data.map(d=>d[colorName])):undefined,[colorName])
    const xValues = useMemo(() => xaxisName!==undefined?data.map(d => d[xaxisName]):_.range(data.length), [xaxisName, xscale,subplotName])

    const sizeScale = useMemo(() => {
        if (sizescale!==undefined) return sizescale
        if (sizeName === undefined) return () => defaultCircleRadius
        
        const sizeDomain = getDomainWithBoundaries({data, keyName : sizeName})
        return scaleLinear({
            domain: [sizeDomain.min, sizeDomain.max],
            range : sizeRange
        })
    },[sizeName, sizescale])

    const colorScale = useMemo(() => {
        if (colorscale !== undefined) return colorscale
        if (uniqueColorValues === undefined) return () => defaultColor
        return (
            scaleOrdinal({
                domain: uniqueColorValues, 
                range : getColorPalette(uniqueColorValues.length)
            })
        )
    },[defaultColor, uniqueColorValues, colorscale])
    
    const xScale = useMemo(() => {
        // x scale 
        if (xscale !== undefined) return xscale
        if (xaxisName) {
            
            const xDomain = getBoundariesFromArrayOfObjects({ data, keyName: xaxisName })
            const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })
            
            return scaleLinear(
                {
                    domain: [xDomainWithMargin.min, xDomainWithMargin.max],
                    range: [margins.left, margins.left + chartWidth],
                    nice: true
                }
            )
        }

        const xDomain = [-0.5,data.length+0.5] //_.uniqBy(data, xaxisName).map(d => d[xaxisName])
        return (
            scaleLinear(
                {
                    domain: xDomain,
                    range: [margins.left, margins.left + chartWidth],
                    round: true
                }
            )
            
            
        )

    }, [xaxisName, width, subplotName])

    
    const yScale = useMemo(() => {
        // y scale 
        const customYAxisDomain = _.isObject(yAxisDomain)
        const yDomain = !customYAxisDomain ?getBoundariesFromArrayOfObjects({ data, keyName: yaxisName }):yAxisDomain
        const yDomainWithMargin = !customYAxisDomain ? addMarginToBoundaries({ domain: yDomain }) : yAxisDomain

        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min < 0 ? yDomainWithMargin.min : 0],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, height])

    const handleMouseOver = (event, datum, mouseOverParams) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: mouseOverParams.dataID
        });
      };
    

    return (
        <div style={{ position: "relative" }}>
        <SVG {...{ width, height, svgID, svgRef : containerRef }}>
            
            <AxisWithBackground
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={xaxisName}
                moveBottomToLeft={false}
                leftLabel={yaxisName}
                    {...{ chartHeight, chartWidth }} />
                
                <SubplotName  text={title} {...{ chartHeight, chartWidth, margins }} />
            <g onMouseLeave={hideTooltip}>
            {data.map((d, idx) => {

                return (
                    <Point
                        key={`${idx}-scatter-cat`}
                        r = {sizeScale(d[sizeName])}
                        p={[xScale(xValues[idx]), yScale(d[yaxisName])]}
                        fill={colorScale(d[colorName])}
                        mouseOverParams={{ dataID: "asd" }}
                        mouseOver={handleMouseOver}

                        />)
            
            })}
            </g>
               

            </SVG>
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >   
                    <div className="flex flex-column center-items">
                        <div>DataID :  <strong>{tooltipData}</strong></div>
                        <MetricTable />
                        <GroupingTable />
                        
                    </div>
                </TooltipInPortal>
            )}
            </div>

    )



}


export default CategoricalScatter