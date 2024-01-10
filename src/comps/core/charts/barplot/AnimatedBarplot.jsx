import { scaleLinear, scaleOrdinal, scaleTime, scaleUtc } from "@visx/scale";
import { SVG } from "../SVGHeader";
import AxisWithBackground from "../axis";
import { motion } from "framer-motion";
import { getChartWidthAndHeightWithMargins } from "../../../../services/plotting/size";
import { addMarginToBoundaries, getBoundariesFromArrayOfObjects } from "../../../../services/arrays/boundaries";
import { useMemo, useRef } from "react";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import _ from "lodash"
import MetricTable from "../../base/metrictable";


function AnimatedBar({x,y,width, height, baselineBar, fill = "red", hoverFill = "#466688", handleMouseOver,hideTooltip, tooltipData, stroke = "#000000", strokeWidth = 1, ...rest}) {
    
    const barVariants = {

        hidden: {opacity : 1},
        visible:  {
                opacity: 1,
                y : y-baselineBar,
                 height : baselineBar - y 
            }
        }
   
    return (
        <motion.rect {...{ x, y : baselineBar, width, height : 0, fill,stroke, strokeWidth, ...rest }}
        animate="visible"
            initial="hidden"
            whileHover={{fill : hoverFill}}
        transition={{duration : 0.85}}
            variants={barVariants}
            onMouseEnter={e => handleMouseOver(e, tooltipData)}
        onMouseLeave={hideTooltip}/>
    )
}

export function AnimatedBarplot({
    data,
    margins = { top: 5, left: 50, bottom: 50, right: 5 },
    xaxisName,
    xaxisNameTimeIntervalEnd = "dateEnd",
    xaxisNameTimeIntervalStart = "dateStart",
    yaxisName,
    width = 350,
    height = 300,
    svgID = null,
    xAxisIsTime = false,
    yaxisStartsAtZero = true,
    title = "",
    leftLabel = ""}) {
    const svgRef = useRef(null)
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

    const handleMouseOver = (event, bartooltipData) => {
        
        const coords = localPoint(svgRef.current, event);
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: bartooltipData
        });
    };
    


    const {chartWidth, chartHeight} = getChartWidthAndHeightWithMargins({width,height,margins})
    
    const xScale = useMemo(() => {

        if (xAxisIsTime) {
            
            return scaleTime({
                range : [margins.left,chartWidth+margins.left],
                domain: [data[0][xaxisName], data.at(-1)[xaxisNameTimeIntervalEnd]],
                nice: true
            })
        }

        const xDomain = getBoundariesFromArrayOfObjects({ data : sortedData, keyName: xaxisName })
        const xDomainWithMargin = addMarginToBoundaries({ domain: xDomain })

        return scaleOrdinal(
            {
                domain: [xDomainWithMargin.min, xDomainWithMargin.max],
                range: [margins.left, margins.left + chartWidth],
                nice : true
            }
        )
        
    }, [xaxisName, width, xAxisIsTime, data.length, xaxisNameTimeIntervalStart, xaxisNameTimeIntervalEnd])

    const yScale = useMemo(() => {
    
        const yDomain = getBoundariesFromArrayOfObjects({ data, keyName: yaxisName })
        const yDomainWithMargin = addMarginToBoundaries({ domain: yDomain })
        return scaleLinear(
            {
                domain: [yDomainWithMargin.max, yaxisStartsAtZero ? 0 : yDomainWithMargin.min],
                range: [margins.top, margins.top + chartHeight],
                nice: true
            }
        )
    }, [yaxisName, height, data.length])
    

    return (
        <div ref={containerRef}>
            <h2>{title}</h2>
        <SVG {...{ width, height, svgRef, svgID }}>
            <AxisWithBackground
                margins={margins}
                moveBottomToLeft={false}
                leftScale={yScale}
                bottomScale={xScale}
                bandwidth={300}
                bottomLabel={""}
                findAttributesForBottomScale={false}
                {...{ chartHeight, chartWidth, leftLabel  }} />
            {data.map((d,idx) => {
                let width = (xScale(d[xaxisNameTimeIntervalEnd]) - xScale(d[xaxisNameTimeIntervalStart])) * 0.95
                const dateString = new Date(d[xaxisName]).toLocaleDateString("en-us",{year : "numeric", month : "short"})
                return <AnimatedBar
                    key={`${idx}-bar`}
                    x={xScale(d[xaxisName])}
                    height={yScale(0) - yScale(d[yaxisName])}
                    width={width}
                    tooltipData={[{text : yaxisName,value : d[yaxisName]},{text : "Date",value : dateString}]}
                    baselineBar={chartHeight + margins.top}
                    y={yScale(d[yaxisName])}
                    fill={"#fff"}
                    {...{handleMouseOver, hideTooltip}} />
            })}

            </SVG>
            {tooltipOpen && (
                <TooltipInPortal
                // set this to random so it correctly updates with parent bounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                >  
                    {_.isArray(tooltipData) ? <MetricTable data={tooltipData} /> : null}
                    {/* <div className="flex flex-column">
                        {Object.keys(tooltipData).map(qLabel => <div key={qLabel}>{qLabel} : <span className="h0-span">{tooltipData[qLabel]}</span></div>)}
                         */}

                </TooltipInPortal>
            )}
            </div>
)
}
