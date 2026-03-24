


import hooks from "@mitocube/api-hooks"
import viz from "@mitocube/viz"
import _ from "lodash"
import InteractiveChart from "../../core/charts/interactive"
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection"
import { useState } from "react"
import { ScatterPlot } from "../../core/charts/scatter"




export function ProteinSubmissionRanking({ tag }) {
    const [selection, setSelection] = useState({ xaxisName: "F", yaxisName: "p_value", colorName : undefined, tooltipNames : [], sizeName : undefined, filterTag : undefined })
    const {data : submissionStats} = hooks.features.protein_groups.useGetProteinGroupSubmissionStats({tag}, { enabled: _.isString(tag) && tag.length > 0 })
    console.log(submissionStats)

    const numericKeyNames = _.isArray(submissionStats) && submissionStats.length > 0 ? _.filter(_.keys(submissionStats[0]), keyName => _.isNumber(submissionStats[0][keyName])) : []
    const handleSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => { return { ...prevValues, [selectionKey]: keyName } })
    }

    if (!_.isArray(submissionStats) || submissionStats.length === 0) {
        return <div>Loading...</div>
    }
        console.log(numericKeyNames, "numeric key names")

        
    return <div><InteractiveChart
            data={submissionStats}
            keyNames={[{ xaxisName: selection.xaxisName, yaxisName: selection.yaxisName }]}>
            
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
                        handleItemSelection,
                        findIndexInRectangle,
                        findDataInRectangle,
                        setHoverDataInRectangle,
                        findClosestPoint,
                        handleNumericFilter,
                        handleStringSearch,
                        handleSearchByDataIndex,
                        filterDataInKeyByValue,
                        hoverProps,
                        filterProps,
                        labelProps,
                        rerenderAxis,
                        triggerResetAxis,
                        setTriggerResetAxisZoom
                            }, didx) => {
                                console.log(valid, hoverProps)
                        return (
                            <div>
                                
                                <ScatterDataSelection keyNames={_.keys(submissionStats[0])}
                                    {...{
                                        title : "Protein Submission Ranking",
                                        numericKeyNames,
                                        itemIsAttribute : false,    
                                        idx: 1,
                                        chartIdx,
                                        setTriggerResetAxisZoom,
                                        selection,
                                        setSelection : handleSelection,
                                        handleStringSearch,
                                        downloadElements: ["network-scatter", submissionStats],
                                        elementNames: ["SVG","DIVIDER",`Data (n = ${submissionStats.length})`],
                                        fileNames: [`${tag}-MitoMap.svg`,`${tag}-Mitomap.txt`],
                                        elementTypes: ["svg", "data"]
                                            }} />
                                <ScatterPlot key={`volcano-plot-${chartIdx}`}{...{
                                                chartIdx,
                                                width: 400,
                                                height : 400,
                                                colorName: selection.colorName,
                                                sizeName: selection.sizeName,
                                                data,
                                                valid,
                                                centerXAxisAtZero : false,
                                                labelNames : ["submission_tag"],
                                                findDataInRectangle,
                                                setHoverDataInRectangle,
                                                findClosestPoint,
                                                xaxisName,
                                                yaxisName,
                                                limits,
                                                tooltipSmall: true,
                                                tooltipNames: ["attribute_tag"],
                                                ...hoverProps,
                                                ...filterProps,
                                                ...labelProps,
                                                attributeValuesByTag: {}, //metadata.attribute_values_by_tag,
                                                attributesByTag: {}, //metadata.attributes,
                                                legend: true,
                                                legendWithAttributes: false,
                                                handleSearchByDataIndex,
                                                filterDataInKeyByValue,
                                                svgID: `submissionsFeatureStats-${didx}`,
                                                triggerResetAxis,
                                                setTriggerResetAxisZoom,
                                            }} />
                            </div>)
                        })}

        
            </InteractiveChart>
        

    </div>
}