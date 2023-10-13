import PropTypes from "prop-types"
import Point from "./Point"
import AxisWithBackground from "../axis"
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size"
import { useMemo } from "react"
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects, getMaxAbsoluteValue } from "../../../../services/arrays/boundaries"
import { scaleLinear } from "@visx/scale"
import { SVG } from "../SVGHeader"
import { useTooltip, useTooltipInPortal, TooltipWithBounds } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import _ from "lodash"
import MetricTable from "../../base/metrictable"

ScatterPlot.propTypes = {

    points : PropTypes.arrayOf(Object),
    defaultRadius: PropTypes.number,
    xaxisName: PropTypes.string.isRequired,
    yaxisName: PropTypes.string.isRequired,
    colorName: PropTypes.string,
    sizeName: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    centerXAxisAtZero : PropTypes.bool
}


export function ScatterPlot({
    width = 500,
    height = 500,
    margins = {
        left: 40,
        top: 25,
        right: 5,
        bottom: 40
    },
    data,
    xaxisName,
    yaxisName,
    colorName = undefined,
    sizeName = undefined,
    svgID = "scatterplot",
    centerXAxisAtZero = true,
    defaultRadius = 5}) {
    // Plots an array of points. Each item in the array 
    // must be an object including the following keys: x, y, r
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
    
    const { chartWidth, chartHeight } = getChartWidthAndHeightWithMargins(width,height,margins)
    
    const yScale = useMemo(() => {
        // y scale for the scatter
    
        const yDomain = getBoundariesFromArrayOfObjects({ data, keyName: yaxisName })
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain})

        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, chartHeight])


    const xScale = useMemo(() => {
        // y scale for the scatter
        const xDomain = getBoundariesFromArrayOfObjects({ data, keyName: xaxisName })
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })
        const maxValue = getMaxAbsoluteValue({data : [xDomainWithMargin.max, xDomainWithMargin.min]})
        
        return scaleLinear(
            {
                domain: centerXAxisAtZero ?  [-maxValue,maxValue] : [xDomainWithMargin.min,xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice: true
            }
        )
    }, [xaxisName, chartWidth])

    const handleMouseOver = (event, datum, mouseOverParams) => {
        const coords = localPoint(event.target.ownerSVGElement, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: mouseOverParams.dataID
        });
    };
    
    const points = useMemo(() => _.map(data, d => { return { p: [xScale(d[xaxisName]), yScale(d[yaxisName])], r: defaultRadius } }),
        [xaxisName, yaxisName,sizeName,colorName])

    return (
        <div>
        <SVG {...{ width, height, svgID }}>
            <AxisWithBackground
                margins={margins}
                leftScale={yScale}
                bottomScale={xScale}
                bottomLabel={xaxisName}
                leftHideTicks={false}
                leftLabel={yaxisName}
                moveBottomToLeft={false}
                {...{ chartHeight, chartWidth }} />
            <g>
                    {points.map((p, pIdx) =>
                        <Point idx={pIdx} {...p}
                            mouseOverParams={{ dataID: "asd" }}
                            mouseOver={handleMouseOver}/>)}
            </g>
        </SVG >
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >   
                    <div className="flex flex-column center-items">
                        <div>DataID :  <strong>{tooltipData}</strong></div>
                    </div>
                </TooltipInPortal>
            )}
        </div>
        

    )
}