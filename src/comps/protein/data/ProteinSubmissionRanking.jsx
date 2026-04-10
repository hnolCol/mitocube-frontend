


import hooks from "@mitocube/api-hooks"
import viz from "@mitocube/viz"
import _ from "lodash"
import InteractiveChart from "../../core/charts/interactive"
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection"
import { useMemo, useState } from "react"
import { ScatterPlot } from "../../core/charts/scatter"

import { FeatureDataView } from "../../analysis/features/DataView"
import { RankingStats } from "../../core/base/submissions/RankingStats"




export function ProteinSubmissionRanking({ tag, N = 10 }) {
    const [selection, setSelection] = useState({ xaxisName: "eta_squared", yaxisName: "cohen_f", colorName : undefined, tooltipNames : [], sizeName : undefined, filterTag : undefined })
    const {data : submissionStats} = hooks.features.protein_groups.useGetProteinGroupSubmissionStats({tag}, { enabled: _.isString(tag) && tag.length > 0 })

    const topSubmissionStats = useMemo(() => {
        if (_.isArray(submissionStats)) {
            return _.slice(_.orderBy(submissionStats, ["score"], ["desc"]), 0, N)
        }
        return []
    }, [_.isArray(submissionStats) && submissionStats.length > 0, tag, N])

    const numericKeyNames = _.isArray(submissionStats) && submissionStats.length > 0 ? _.filter(_.keys(submissionStats[0]), keyName => _.isNumber(submissionStats[0][keyName])) : []
    const handleSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => { return { ...prevValues, [selectionKey]: keyName } })
    }

    if (!_.isArray(submissionStats) || submissionStats.length === 0) {
        return <div>Loading...</div>
    }
        console.log(numericKeyNames, "numeric key names")

    
    const getSubmissionStats = (tag) => {
        if (!_.isArray(submissionStats)) return null
        if (!_.isString(tag)) return null
        const stats = submissionStats.filter(stat => stat.tag === tag)[0]
        if (!_.isObject(stats)) return null 
    
        const metrices = Object.keys(stats).filter(key => key !== "attribute_tag" && key !== "submission_tag" && key !== "tag").map(keyStat => { return { text: keyStat, value: stats[keyStat] } })
        return <RankingStats attribute_tag={stats.attribute_tag} submission_tag={stats.submission_tag}  stats={metrices}/>
    }
    
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
                                console.log(valid, hoverProps.hoverIndices)
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
                                                tooltipNames: ["tag"],
                                                tooltipNameIsStats: {"tag" : getSubmissionStats},
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
        


        <div>


            
                {_.isArray(topSubmissionStats) ? <FeatureDataView feature_tags={topSubmissionStats.map(i => tag)} submission_tag={topSubmissionStats.map(d => d.submission_tag)} /> : null}

    

        </div>
        

    </div>
}