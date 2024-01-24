import React from "react";
import { LegendItem, LegendLabel, LegendLinear, LegendOrdinal, LegendSize } from "@visx/legend";
import { Tooltip, useTooltip } from "@visx/tooltip";
import _ from "lodash"
import { roundNumber } from "../../../../services/format/number";

/**
 * @description Checks if the legend should rerender. basically only a change in colorName or sizeName causes a rerender. 
 * This might be important if the list of items is long.
 * @param {Object} prevProps 
 * @param {*} nextProps 
 * @returns 
 */
function areEqual(prevProps, nextProps) {
    if (prevProps.colorName !== nextProps.colorName) return false 
    if (prevProps.sizeName !== nextProps.sizeName) return false 
    return true
  }


const ScatterLegend = React.memo(
    /**
     * 
     * @param {Object} props 
     * @param {Object[]} props.data 
     * @param {Function} props.colorScale 
     * @param {Function} props.sizeScale 
     * @param {String} props.colorName 
     * @param {String} props.sizeName 
     * @returns 
     */
    function ScatterLegend({
        chartIdx,
        data,
        maxWidth,
        colorScale,
        sizeScale,
        colorName,
        sizeName,
        filterDataInKeyByValue,
        resetSearchIdcs,
        size = 25,
        colorLimit = {},
        sizeLimit = {},
        attributesByTag }) {
    
        const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    
    } = useTooltip();


    const findAttributeValues = (attributeValueTagsString) => {
        // there might be multiple tags which are separated by a space. 
        const attributeValueTags = _.split(attributeValueTagsString, " ")
        return _.map(attributeValueTags.map(attributeValueTag => _.has(attributesByTag.attribute_values, attributeValueTag) ?
            attributesByTag.attribute_values[attributeValueTag] :
            { text: attributeValueTag, description: "" }))

    }
    

    const getLegendLabelFromAttributeValues = (attributeValues) => {
        return attributeValues.length === 1?attributeValues[0].text : _.join(attributeValues.map(attributeValue => attributeValue.text), " + ")
    }

    /**
     * 
     * @param {MouseEvent} e 
     * @param {import("../../../../types/attributes").AttributeValue[]} props.attributeValues
     */
    const handleTooltip = (e,attributeValues) => {

        showTooltip({
            tooltipTop : e.clientY,
            tooltipLeft: e.clientX,
            tooltipData : attributeValues
        })
    }

    /**
     * 
     * @param {Number} size - The size of the SVG 
     * @param {String} fill - The hex color fill of the circle.
     * @param {Number} r - The radius of the circle.
     * @returns 
     */
    const renderLegendCircle = (size, fill, r) => {
        return <svg width={size} height={size} ><circle cx={size / 2} cy={size / 2}
                fill={fill}
                r={r}
                stroke="#000"
                strokeWidth={0.5} />
            </svg>
    } 

    return (
        <div>
            <div className="flex" style={{maxWidth, maxHeight : "900px", overflowY:"scroll"}}>
                {_.has(colorScale,"domain") ? _.isString(colorName) && _.isString(data[0][colorName]) ? 
                    <div onMouseLeave={() => resetSearchIdcs(chartIdx)} className="intent-margin-left--little">
                        <h4>{colorName}</h4>
                        <LegendOrdinal scale={colorScale}>
                            {(labels) => labels.map((label, idx) => {   
                                if (idx > 25) return null 
                                const attributeValues = findAttributeValues(label.text)
                                const labelString = getLegendLabelFromAttributeValues(attributeValues)
                                return (
                                    <LegendItem key={`${idx}-${label}`} onMouseEnter={() => filterDataInKeyByValue(chartIdx, colorName, label.datum)}> 
                                        {renderLegendCircle(size,label.value,size/3)}
                                        <LegendLabel align="left" margin={"0 4px"} onMouseEnter={(e) => handleTooltip(e,attributeValues)} onMouseLeave={hideTooltip}>{labelString}</LegendLabel>
                                    </LegendItem>
                                )
                            })}
                        </LegendOrdinal></div> :
                
                    <div className="intent-margin-left--little">
                        <h4>{colorName}</h4>
                        <LegendLinear scale={colorScale} labelFormat={(d, i) => roundNumber({ number: d, limit : colorLimit })}>
                            {(labels) => labels.map((label, idx) => {
                            if (idx > 25) return null 
                                return (
                                <LegendItem>
                                    {renderLegendCircle(size,label.value,size/3)}
                                    <LegendLabel align="left" margin={"0 4px"}>{label.text}</LegendLabel>
                                </LegendItem>
                            )
                        })}
                    </LegendLinear></div> : null}
                
                {_.has(sizeScale,"domain")?_.isString(sizeName) && _.isString(data[0][sizeName]) ? 
                    <div onMouseLeave={() => resetSearchIdcs(chartIdx)} className="intent-margin-left--little">
                        <h4>{sizeName}</h4>
                        <LegendOrdinal scale={sizeScale}>
                            {(labels) => labels.map((label, idx) => {  
                                if (idx > 25) return null 
                                return (
                                        <LegendItem onMouseEnter={() => filterDataInKeyByValue(chartIdx, sizeName, label.datum)}> 
                                        {renderLegendCircle(size,"#fff",label.value)}
                                        <LegendLabel align="left" margin={"0 4px"}>
                                            {label.text}
                                                </LegendLabel>
                                                </LegendItem>
                                )
                            })}
                        </LegendOrdinal></div> :
                        <div className="intent-margin-left--little">
                        <h4>{sizeName}</h4>
                        <LegendSize scale={sizeScale}>
                            {(labels) => labels.map((label, idx) => {
                                if (idx > 25) return null 
                            return (
                                <LegendItem>
                                    {renderLegendCircle(size,"#fff",label.value)}
                                    <LegendLabel align="left" margin={"0 4px"}>{roundNumber({ number: label.datum, limit: sizeLimit })}</LegendLabel>
                                </LegendItem>
                            )
                        })}
                    </LegendSize></div>: null}

            </div>
            {tooltipOpen && _.isArray(tooltipData) ?
                <Tooltip top={tooltipTop} left={tooltipLeft} key={Math.random()}>

                    <div>{tooltipData.map(attributeValue => <div>
                        <h4>{attributeValue.text}</h4>
                            <div style={{ maxWidth: "min(33vw,400px)" }}>
                            {attributeValue.description}
                        </div>
                    </div>)}
                    </div>
            </Tooltip> : null}

        </div>
    )
    }, areEqual )

export { ScatterLegend }

