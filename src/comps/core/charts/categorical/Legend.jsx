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


const CategoricalLegend = React.memo(
    /**
     * 
     * @param {Object} props 
     * @param {Object[]} props.data 
     * @param {Function} props.colorScale 
     * @param {String} props.colorName 
     * @returns 
     */
    function ScatterLegend({
        chartIdx,
        data,
        maxWidth,
        colorScale,
        colorName,
        filterDataInKeyByValue,
        resetSearchIdcs,
        size = 25,
        attributesByTag,
        attributeValuesByTag,
        genotypesByLabel
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
        // there might be multiple tags which are separated by a space. 
        if (attribute.tag === "att_genotype") {
            const genotypeLabels = _.split(attributeValueTagsString, " ")
            return genotypeLabels.map(genotypeLabel => genotypesByLabel[genotypeLabel]).filter(genotypeLabel => _.isObject(genotypeLabel))
        }
        const attributeValueTags = _.split(attributeValueTagsString, " ")
        return attributeValueTags.map(attributeValueTag => attributeValuesByTag[attributeValueTag]).filter(attributeValue => _.isObject(attributeValue))
    }
    

    const getLegendLabelFromAttributeValues = (attribute, attributeValues) => {
        let attributeValueText = ""
        if (attribute.tag === "att_genotype") {

            attributeValueText = "gene"
        }
        else if (attribute.has_features_value) {
            attributeValueText = attributeValues.length === 1 ? attributeValues[0].genes.split(" ").at(0) : _.join(attributeValues.map(attributeValue => attributeValue.genes.split(" ").at(0)), " + ")
        }
        else {
            attributeValueText = attributeValues.length === 1?attributeValues[0].text : _.join(attributeValues.map(attributeValue => attributeValue.text), " + ")
        }
        console.log(attributeValueText)
        return attributeValueText
    }

    /**
     * 
     * @param {MouseEvent} e 
     * @param {import("../../../../types/attributes").AttributeValue[]} props.attributeValues
     */
    const handleTooltip = (e,attributeValues,attribute) => {

        showTooltip({
            tooltipTop : e.clientY,
            tooltipLeft: e.clientX,
            tooltipData: { attributeValues, attribute, has_features_value : attribute.has_features_value }
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
                    <div className="intent-margin-left--little">
                    {/* //onMouseLeave={() => resetSearchIdcs(chartIdx)} */}
                        <h4>{colorAttribute.text}</h4>
                        <LegendOrdinal scale={colorScale}>
                            {(labels) => labels.map((label, idx) => {
                                if (idx > 25) return null
                                const attributeValues = findAttributeValues(label.text)
                                const labelString = getLegendLabelFromAttributeValues(colorAttribute,attributeValues)
                                return (
                                    <LegendItem key={`${idx}-${label}`} >
                                    {/* //onMouseEnter={() => filterDataInKeyByValue(chartIdx, colorName, label.datum)} */}
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
                        <h4>{tooltipData.has_features_value ? attributeValue.genes : attributeValue.text }</h4>
                        <div style={{ maxWidth: "min(33vw,400px)" }}>
                            <p>{tooltipData.has_features_value ? attributeValue.key: null}</p>
                            {tooltipData.has_features_value ? attributeValue.proteins : attributeValue.description}
                        </div>
                    </div>)}
                    </div>
            </Tooltip> : null}

        </div>
    )
    }, areEqual )

export { CategoricalLegend }






