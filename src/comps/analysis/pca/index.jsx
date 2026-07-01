import _ from "lodash"
import { useOutletContext } from "react-router";
import { useEffect, useMemo, useState } from "react";

import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { getNumericKeysFromArrayOfObjects } from "../../../services/arrays/filter";
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection";

import { api } from "@/api";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";
import { Loading } from "@/comps/core/base/states/Loading";


function PCALoader({ submission_tag, annotation_tag }) {
    const showHoverLabels = true
    const [requiredProteinTags, setRequiredProteinTags] = useState([])
    // const { data: ca_attribute_tags } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({ tag: submission_tag }, { enabled: _.isString(submission_tag) && submission_tag.length > 0 })
    const { data : attribute_ca_tags, isSuccess} = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : submission_tag, return_unique : true}, {enabled : _.isString(submission_tag),  staleTime : Infinity}    )
    const { data: pcaresults, isSuccess : isPCADataSuccess, isLoading : isPCALoading } = api.submissions.analysis.useGetSubmissionPCA({ tag: submission_tag, annotation_tag }, { enabled: _.isString(submission_tag), staleTime: Infinity })
    
    const { ca_attribute_tags, ca_tags } = useMemo(() => {
        if (!isSuccess || !_.isObject(attribute_ca_tags)) return { ca_attribute_tags: [], ca_tags: [] }
        const ca_attribute_tags = _.keys(attribute_ca_tags)
        const ca_tags = _.values(attribute_ca_tags).flat()
        return { ca_attribute_tags, ca_tags }
    }, [submission_tag, isSuccess])
    

    // return <div>"he</div>

    return <WithTagMaps 
        Component={PCAPlot}
        attribute_tags={ca_attribute_tags}
        ca_tags={ca_tags}
        protein_tags={requiredProteinTags}
        showProteinSearch={true}
        proteinSearchProps={{ submission_tag }}
        {...{
            submission_tag,
            pcaresults,
            isPCALoading,
            showHoverLabels,
            setRequiredProteinTags
        }} />
}
    
    // <WithTagMaps
    //                 Component={VolcanoDataHandler}
    //                     protein_tags={requiredProteinTags}
    //                     showProteinSearch={true}
    //                     proteinSearchProps={{submission_tag}}
    //                     {...{
    //                         submission_tag, 
    //                         volcanoData, setVolcanoData,
    //                         selectedTestParams,
    //                         setIsFetching,
    //                         onError,
    //                         hiddenSuffix,
    //                         setHiddenSuffix,
    //                         setRequiredProteinTags,
    //                         favoriteProteinSelection,
    //                         proteinHoverResults,
    //                         favoriteAnnotationSelection,
    //                         annotationHoverResults,
    //                         showHoverLabels
    //                     }} />
    // }

function DatasetPCA({ }) {

    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { submission_tag } = useOutletContext()
    
    return <PCALoader submission_tag={submission_tag} />
}


function PCAPlot({ submission_tag, ca_tags, pcaresults, isPCALoading, attribute_tags, caTagMap, attributeTagMap, proteinTagMap, isReady, proteinIsLoading, proteinSearchResults, setRequiredProteinTags, showHoverLabels, externalSearchResult }) {
    

    const [selection, setSelection] = useState({ xaxisName: undefined, yaxisName: undefined, colorName: undefined, tooltipNames: [], sizeName: undefined, filterTag: undefined })
    const pcaResultsValid = _.isObject(pcaresults) && _.isArray(pcaresults.drivers) && _.isArray(pcaresults.projection)
    const numericKeyNames = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.drivers) : []
    const nonNumericKeyNames = pcaResultsValid ? _.keys(pcaresults.drivers[0]).filter(keyName => !numericKeyNames.includes(keyName)) : []
    const numericKeyNamesProjection = pcaResultsValid ? getNumericKeysFromArrayOfObjects(pcaresults.projection) : []



    useEffect(() => {
        if (!_.isObject(pcaresults) && !isPCALoading) return
        setSelection({
            xaxisName: numericKeyNames[0],
            yaxisName: numericKeyNames[1],
            tooltipNames: [],
            colorName: undefined,
        })
    }, [_.isObject(pcaresults)])

    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => { return { ...prevValues, [selectionKey]: keyName } })
    }


    return (<div className="div--expand" style={{ overflowY: "scroll", height: "90vh " }}>
        <h2>Principal Component Analysis</h2>
        {_.isObject(pcaresults) && _.isArray(pcaresults.variance_explained) ? <span>{pcaresults.variance_explained.length} components calculated, explaining {_.round(_.sum(pcaresults.variance_explained) * 10000) / 100}% of the total variance.</span> : null}
        
        {isPCALoading ? <Loading />: <div className = "flex" style={{ gap: "5rem", marginTop: "1rem" }}>
           
            <div>
                <ScatterDataSelection
                    keyNames={_.keys(pcaresults.projection[0])}
                    {...{
                        title: "Projection",
                        idx: 0,
                        numericKeyNames,
                        selection,
                        itemIsAttribute: true,
                        numericIsAttribute: false,
                        setSelection: handleScatterSelection,
                        downloadElements: ["scatter_plot-pca-projection", pcaresults.projection],
                        elementNames: ["SVG", "DIVIDER", `Projected Data (${pcaresults.projection.length} x ${_.keys(pcaresults.projection[0]).length})`],
                        fileNames: [`${submission_tag}-PCA.svg`, `${submission_tag}-PCA-Projection.txt`],
                        elementTypes: ["svg", "data"]
                    }} />
                {pcaResultsValid ? <InteractiveChart
                    data={pcaresults.projection}
                    extraLimitNames={[selection.colorName, selection.sizeName].filter(keyName => _.isString(keyName) && numericKeyNamesProjection.includes(keyName))}
                    keyNames={[
                        {
                            xaxisName: selection.xaxisName,
                            yaxisName: selection.yaxisName
                        }]}
                    isPointChart={[true]}>
                    {
                        /**
                         * 
                         * @param {import("../../../types/charts").InteractiveChartResponse[]} chartData 
                         * @returns 
                         */
                        (chartData) => chartData.map(({
                            data,
                            chartIdx,
                            xaxisName,
                            yaxisName,
                            valid,
                            limits,
                            findDataInRectangle,
                            setHoverDataInRectangle,
                            handleSearchByDataIndex,
                            filterDataInKeyByValue,
                            hoverProps,
                            filterProps
                        }, didx) => {
                            return (
                                <div>
                                                    
                                    <ScatterPlot key={`${chartIdx}`}{...{
                                        chartIdx,
                                        colorName: selection.colorName,
                                        sizeName: selection.sizeName,
                                        data,
                                        valid,
                                        findDataInRectangle,
                                        setHoverDataInRectangle,
                                        xaxisName,
                                        yaxisName,
                                        limits,
                                        tooltipSmall: false,
                                        tooltipNames: [],
                                        ...hoverProps,
                                        ...filterProps,
                                                    
                                        // attributeValuesByTag: metadata.attribute_values_by_tag,
                                        // attributesByTag: metadata.attributes,
                                        // genotypesByLabel : metadata.genotypes,
                                        legend: true,
                                        handleSearchByDataIndex,
                                        filterDataInKeyByValue,
                                        svgID: "scatter_plot-pca-projection"
                                                
                                    }} />
                                </div>)
                        })}

                </InteractiveChart> : null}
            </div>
            {/* Drivers plot. */}
            {pcaResultsValid ? <InteractiveChart
                data={pcaresults.drivers}
                externalSearchResult={proteinSearchResults}
                extraLimitNames={numericKeyNames}
                keyNames={
                    [
                        { xaxisName: selection.xaxisName, yaxisName: selection.yaxisName }
                    ]}
                isPointChart={[true]}
                passOnProps={{ setRequiredProteinTags, proteinTagMap, proteinIsLoading, showHoverLabels }}
            >
                {(chartData) => chartData.map(({
                    data,
                    chartIdx,
                    xaxisName,
                    yaxisName,
                    valid,
                    limits,
                    findDataInRectangle,
                    setHoverDataInRectangle,
                    filterDataInKeyByValue,
                    hoverProps,
                    filterProps,
                    labelProps,
                    findClosestPoint,
                    triggerResetAxis,
                    setTriggerResetAxisZoom,
                    setRequiredProteinTags,
                    proteinTagMap,
                    proteinIsLoading,
                    showHoverLabels
                }, didx) => {
                    return (<div key={`${didx}-driver-pca-${xaxisName}`}>
                        <ScatterDataSelection keyNames={_.keys(pcaresults.drivers[0])}
                            {...{
                                title: "Drivers",
                                numericKeyNames,
                                showAxisSelection: false,
                                showMarksSelection: false,
                                idx: 1,
                                chartIdx,
                                selection,
                                setSelection: handleScatterSelection,
                                setTriggerResetAxisZoom,
                                itemIsAttribute: false,
                                numericIsAttribute: false,
                                downloadElements: ["scatter_plot-pca-drivers", pcaresults.drivers],
                                elementNames: ["SVG", "DIVIDER", `Data (${pcaresults.drivers.length} x ${_.keys(pcaresults.drivers[0]).length})`],
                                fileNames: [`${submission_tag}-PCA-drivers.svg`, `${submission_tag}-PCA-Drivers.txt`],
                                elementTypes: ["svg", "data"]
                            }} />
                                    
                        <ScatterPlot key={`${chartIdx}-drivers-${submission_tag}`}{...{
                            chartIdx,
                            data,
                            valid,
                            svgID: "scatter_plot-pca-drivers",
                            sizeName: selection.sizeName,
                            colorName: selection.colorName,
                            tooltipNames: ["tag"],
                            labelNames: [],
                            findDataInRectangle,
                            setHoverDataInRectangle,
                            filterDataInKeyByValue,
                            findClosestPoint,
                            ...labelProps,
                            xaxisName,
                            yaxisName,
                            limits,
                            ...hoverProps,
                            ...filterProps,
                            proteinTagMap,
                            attributeTagMap,
                            caTagMap,
                            legendWithAttributes: false,
                            triggerResetAxis,
                            setTriggerResetAxisZoom,
                            // annotationMarkers: annotationMarkers,
                            setRequiredProteinTags,
                            proteinIsLoading,
                            labelIsProtein: true,
                            showHoverLabels,
                            tooltipNameIsProtein: { "tag": true },
                                    
                        }} />
                                    
                    </div>)
                })}

            </InteractiveChart> : null}
        </div>}
        
    </div>
        )

}


export default DatasetPCA