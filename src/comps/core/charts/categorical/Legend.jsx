import React from "react";
import { LegendItem, LegendLabel, LegendLinear, LegendOrdinal, LegendSize } from "@visx/legend";
import { Tooltip, useTooltip } from "@visx/tooltip";
import _ from "lodash"

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


const CategoricalLegend = React.memo(
    /**
     * 
     * @param {Object} props 
     * @param {Object[]} props.data 
     * @param {Function} props.colorScale 
     * @param {String} props.colorName 
     * @returns 
     */
    function CategoricalLegend({
        chartIdx,
        data,
        maxWidth,
        colorScale,
        colorName,
        filterDataInKeyByValue,
        resetSearchIdcs,
        size = 25,

    }) {
        

        const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    
    } = useTooltip();

        const findAttributeValues = (attribute, attributeValueTagsString) => {
            return []
           
        }
    

        const getLegendLabelFromAttributeValues = (attribute, attributeValues) => {
            let attributeValueText = ""
            const numberAttributeValues = attributeValues.length
        if (attribute.tag === "att_genotype") {
            attributeValueText = numberAttributeValues === 1 ? attributeValues[0].text : _.join(attributeValues.map(attributeValue => attributeValue.text), " + ")
        }
        else if (attribute.has_features_value) {
            attributeValueText = numberAttributeValues === 1 ? attributeValues[0].gene_name : _.join(attributeValues.map(attributeValue => attributeValue.gene_name), " + ")
        }
        else {
            attributeValueText = numberAttributeValues === 1?attributeValues[0].text : _.join(attributeValues.map(attributeValue => attributeValue.text), " + ")
        }
        return attributeValueText
    }

    /**
     * 
     * @param {MouseEvent} e 
     * @param {import("../../../../types/attributes").AttributeValue[]} props.attributeValues
     */
    const handleTooltip = (e) => {

        showTooltip({
            tooltipTop : e.clientY,
            tooltipLeft: e.clientX,
            tooltipData: {  }
        })
    }
    /**
     * 
     * @param {Number} size - The size of the SVG 
     * @param {String} fill - The hex color fill of the circle.
     * @param {Number} r - The radius of the circle.
     * @returns 
     */
    const renderLegendRectangle = (size, fill, r) => {
        return <svg width={size} height={size} ><circle cx={size / 2} cy={size / 2}
                fill={fill}
                r={r}
                stroke="#000"
                strokeWidth={0.5} />
            </svg>
        } 

    
        const colorAttribute = _.has(attributesByTag, colorName) ? attributesByTag[colorName] : undefined

    return (
        <div>
            <div className="flex" style={{maxWidth, maxHeight : "900px", overflowY:"scroll"}}>
                {_.has(colorScale, "domain") ? _.isObject(colorAttribute) ?
                    <div className="margin-left--little">
                    {/* //onMouseLeave={() => resetSearchIdcs(chartIdx)} */}
                        <div style={{maxWidth : "10rem"}}><h4>{colorAttribute.text}</h4></div>
                        <LegendOrdinal scale={colorScale}>
                            {(labels) => labels.map((label, idx) => {
                                if (idx > 25) return null
                                const attributeValues = findAttributeValues(colorAttribute, label.text)
                                const labelString = getLegendLabelFromAttributeValues(colorAttribute,attributeValues)
                                return (
                                    <LegendItem key={`${idx}-${label}`} >
                                        {renderLegendRectangle(size, label.value, size / 3)}
                                        <LegendLabel align="left" margin={"0 4px"} onMouseEnter={(e) => handleTooltip(e, attributeValues, colorAttribute)} onMouseLeave={hideTooltip}>{labelString}</LegendLabel>
                                    </LegendItem>
                                )
                            })}
                        </LegendOrdinal></div> : null  : null }

            </div>
            {tooltipOpen && _.isObject(tooltipData) ?
                <Tooltip top={tooltipTop} left={tooltipLeft} key={Math.random()}>
                    <div>{tooltipData.attributeValues.map(attributeValue => <div>
                        <h4>{tooltipData.has_features_value ? attributeValue.gene_names : attributeValue.text }</h4>
                        <div style={{ maxWidth: "min(33vw,400px)" }}>
                            <p>{tooltipData.has_features_value ? attributeValue.tag: null}</p>
                            {tooltipData.has_features_value ? attributeValue.protein_name : attributeValue.description}
                        </div>
                    </div>)}
                    </div>
            </Tooltip> : null}

        </div>
    )
    }, areEqual )

export { CategoricalLegend }






