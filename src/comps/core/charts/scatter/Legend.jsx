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
    if (prevProps.maxWidth !== nextProps.maxWidth) return false
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
        attributeValuesByTag = {},
        attributesByTag = {},
        genotypesByLabel = {}}) {
    
        const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip();
    console.log(maxWidth)
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
            attributeValueText = _.join(_.map(attributeValues, attrValues => attrValues.text), " ")
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
    const renderLegendCircle = (size, fill, r) => {
        return <svg width={size} height={size} ><circle cx={size / 2} cy={size / 2}
                fill={fill}
                r={r}
                stroke="#000"
                strokeWidth={0.5} />
            </svg>
    } 
    const colorAttribute = _.isString(colorName) && _.has(attributesByTag,colorName) ? attributesByTag[colorName] : ""
    const sizeAttribute = _.isString(sizeName) && _.has(attributesByTag, sizeName) ? attributesByTag[sizeName] : ""

        return (
        <div>
            <div className="flex flex-column" style={{maxWidth, maxHeight : "900px", overflowY:"scroll"}}>
                {_.has(colorScale,"domain") ? _.isString(colorName) && _.isString(data[0][colorName]) ? 
                    <div onMouseLeave={() => resetSearchIdcs(chartIdx)} className="intent-margin-left--little">
                        <h4>{colorAttribute.text}</h4>
                        <LegendOrdinal scale={colorScale}>
                            {(labels) => labels.map((label, idx) => {   
                                if (idx > 25) return null 
                                const attributeValues = findAttributeValues(colorAttribute,label.text)
                                if (attributeValues.length === 0) return null 
                                const labelString = getLegendLabelFromAttributeValues(colorAttribute, attributeValues)
                                
                                return (
                                    <LegendItem key={`${idx}-${label}-colorcat`} onMouseEnter={() => filterDataInKeyByValue(chartIdx, colorName, label.datum)}> 
                                        {renderLegendCircle(size,label.value,size/3)}
                                        <LegendLabel align="left" margin={"0 4px"} onMouseEnter={(e) => handleTooltip(e,attributeValues,colorAttribute)} onMouseLeave={hideTooltip}>{labelString}</LegendLabel>
                                    </LegendItem>
                                )
                            })}
                        </LegendOrdinal></div> :
                
                    <div className="intent-margin-left--little">
                        <h4>{colorAttribute.text}</h4>
                        <LegendLinear scale={colorScale} labelFormat={(d, i) => roundNumber({ number: d, limit : colorLimit })}>
                            {(labels) => labels.map((label, idx) => {
                            if (idx > 25) return null 
                                return (
                                <LegendItem key={`${idx}-${label}-colornum`}>
                                    {renderLegendCircle(size,label.value,size/3)}
                                    <LegendLabel align="left" margin={"0 4px"}>{label.text}</LegendLabel>
                                </LegendItem>
                            )
                        })}
                    </LegendLinear></div> : null}
                {_.has(sizeScale,"domain")?_.isString(sizeName) && _.isString(data[0][sizeName]) ? 
                    <div onMouseLeave={() => resetSearchIdcs(chartIdx)} className="intent-margin-left--little">
                        <h4>{sizeAttribute.text}</h4>
                        <LegendOrdinal scale={sizeScale}>
                            {(labels) => labels.map((label, idx) => {  
                                const attributeValues = findAttributeValues(sizeAttribute,label.text)
                                if (attributeValues.length === 0) return null 
                                const labelString = getLegendLabelFromAttributeValues(sizeAttribute, attributeValues)
                                if (idx > 25) return null 
                                return (
                                        <LegendItem key={`${idx}-${label.text}-sizecat`} onMouseEnter={() => filterDataInKeyByValue(chartIdx, sizeName, label.datum)}> 
                                        {renderLegendCircle(size,"#fff",label.value)}
                                        <LegendLabel align="left" margin={"0 4px"}>
                                            {labelString}
                                                </LegendLabel>
                                                </LegendItem>
                                )
                            })}
                        </LegendOrdinal></div> :
                        <div className="intent-margin-left--little">
                        <h4>{sizeAttribute.text}</h4>
                        <LegendSize scale={sizeScale}>
                            {(labels) => labels.map((label, idx) => {
                                if (idx > 25) return null 
                            return (
                                <LegendItem key={`${idx}-${label.text}-sizenum`}>
                                    {renderLegendCircle(size,"#fff",label.value)}
                                    <LegendLabel align="left" margin={"0 4px"}>{roundNumber({ number: label.datum, limit: sizeLimit })}</LegendLabel>
                                </LegendItem>
                            )
                        })}
                    </LegendSize></div>: null}

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
    }, areEqual)
    



    const TextScatterLegend = React.memo(
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
        function TextScatterLegend({
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
            }) {
        
    
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
                <div className="flex flex-column" style={{maxWidth, maxHeight : "900px", overflowY:"scroll"}}>
                    {_.has(colorScale,"domain") ? _.has(data[0],colorName) && _.isEmpty(colorLimit)? 
                        <div onMouseLeave={() => resetSearchIdcs(chartIdx)} className="intent-margin-left--little">
                            <h4>{colorName}</h4>
                            <LegendOrdinal scale={colorScale}>
                                {(labels) => labels.map((label, idx) => {   
                                    
                                    return (
                                        <LegendItem key={`${idx}-${label}-colorcat`} >  
                                            {/* // onMouseEnter={() => filterDataInKeyByValue(chartIdx, colorName, label.datum)} */}
                                            {renderLegendCircle(size,label.value,size/3)}
                                            <LegendLabel align="left" margin={"0 4px"} >
                                                {label.text}</LegendLabel>
                                        </LegendItem>
                                    )
                                })}
                            </LegendOrdinal></div> :
                    
                        <div className="intent-margin-left--little">
                            <h4>{colorName}</h4>
                            <LegendLinear scale={colorScale} labelFormat={(d, i) => roundNumber({ number: d, limit : colorLimit })}>
                                {(labels) => labels.map((label, idx) => {
                                    return (
                                    <LegendItem key={`${idx}-${label}-colornum`}>
                                        {renderLegendCircle(size,label.value,size/3)}
                                        <LegendLabel align="left" margin={"0 4px"}>{label.text}</LegendLabel>
                                    </LegendItem>
                                )
                            })}
                        </LegendLinear></div> : null}
                    {_.has(sizeScale,"domain")?_.isString(sizeName) && _.isEmpty(sizeLimit) ? 
                        <div onMouseLeave={() => resetSearchIdcs(chartIdx)} className="intent-margin-left--little">
                            <h4>{sizeName}</h4>
                            <LegendOrdinal scale={sizeScale}>
                                {(labels) => labels.map((label, idx) => {  
                                    return (
                                        <LegendItem key={`${idx}-${label}-sizecat`} > 
                                            {/* onMouseEnter={() => filterDataInKeyByValue(chartIdx, sizeName, label.datum)} */}
                                            {renderLegendCircle(size,"#fff",label.value)}
                                            <LegendLabel align="left" margin={"0 4px"}>
                                                {label.text}
                                                    </LegendLabel>
                                                    </LegendItem>
                                    )
                                })}
                            </LegendOrdinal></div> :
                            <div className="intent-margin-left--little">
                            <h4>Size legend</h4>
                            <LegendSize scale={sizeScale}>
                                {(labels) => labels.map((label, idx) => {
                                    if (idx > 25) return null 
                                return (
                                    <LegendItem key={`${idx}-${label}-sizenum`}>
                                        {renderLegendCircle(size,"#fff",label.value)}
                                        <LegendLabel align="left" margin={"0 4px"}>{roundNumber({ number: label.datum, limit: sizeLimit })}</LegendLabel>
                                    </LegendItem>
                                )
                            })}
                        </LegendSize></div>: null}
    
                </div>
    
            </div>
        )
        }, areEqual )

export { ScatterLegend, TextScatterLegend }

