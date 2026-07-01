



import _ from "lodash"
import InteractiveChart from "../../core/charts/interactive"
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection"
import { useMemo, useState } from "react"
import { ScatterPlot } from "../../core/charts/scatter"

import { FeatureDataView } from "../../analysis/features/DataView"
import { RankingStats } from "../../core/base/submissions/RankingStats"
import { api } from "@/api";
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"

const METRICES = ["log2_fc_vs_mean", "raw", "z_score_sample", "z_score_protein_group"]


export function ProteinSubmissionRanking({ tag, N = 10 }) {
    const [selection, setSelection] = useState({ xaxisName: "eta_squared", yaxisName: "score", colorName: undefined, tooltipNames: [], sizeName: undefined, filterTag: undefined })
    const [metrics, setMetrics] = useState(METRICES[0])
    const {data : submissionStats} = api.features.ranking.useGetProteinGroupSubmissionStats({tag}, { enabled: _.isString(tag) && tag.length > 0 })
    const { feature_tags, submission_tags} = useMemo(() => {
        if (_.isArray(submissionStats)) {
            const topStats = _.uniqBy(_.slice(_.orderBy(submissionStats, ["score"], ["desc"]), 0, N), "submission_tag");
            return {
                feature_tags: topStats.map(stat => tag), //all the same feature tag, which is the one in the props
                submission_tags: topStats.map(stat => stat.submission_tag)
            };
        }
        return { feature_tags: [], submission_tags: [] };
    }, [_.isArray(submissionStats) && submissionStats.length > 0, tag, N])


    const numericKeyNames = _.isArray(submissionStats) && submissionStats.length > 0 ? _.filter(_.keys(submissionStats[0]), keyName => _.isNumber(submissionStats[0][keyName])) : []
    const handleSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => { return { ...prevValues, [selectionKey]: keyName } })
    }

    if (!_.isArray(submissionStats) || submissionStats.length === 0) {
        return <div>Loading...</div>
    }

    
    const getSubmissionStats = (tag) => {
        if (!_.isArray(submissionStats)) return null
        if (!_.isString(tag)) return null
        const stats = submissionStats.filter(stat => stat.tag === tag)[0]
        if (!_.isObject(stats)) return null 
    
        const metrices = Object.keys(stats).filter(key => key !== "attribute_tag" && key !== "submission_tag" && key !== "tag").map(keyStat => { return { text: keyStat, value: stats[keyStat] } })
        return <RankingStats attribute_tag={stats.attribute_tag} submission_tag={stats.submission_tag}  stats={metrices}/>
    }
    
    return <div>
        <h3>Protein Submission Ranking</h3>
        <span>Features are ranked by statistic approaches. Find more information in the documentation.</span>
        <div className="flex" style={{gap : "3rem", marginTop : "1rem"}}>
        <div><InteractiveChart
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
                        return (
                            <div>
                                <ScatterDataSelection keyNames={_.keys(submissionStats[0])}
                                    {...{
                                        // title : ,
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
                                                labelIsProtein : false
                                            }} />
                            </div>)
                        })}

        
    </InteractiveChart>
        
                <div>
                    <h3>Settings</h3>
                    <span>Choose metrics to display data.</span>
                    
                    <div className="flex" style={{ marginBottom: "0.75rem", flexShrink: 0 }}>
                            {METRICES.map(option => (
                                <OptionButton key={option} onClick={() => setMetrics(option)} isSelected={option === metrics}>
                                    {option}
                                </OptionButton>
                            ))}
                    </div>
                    
                    

                
                </div>
            </div>

        <div style={{width : "75vw", borderLeft : "1px solid #ccc", paddingLeft : "2rem"}}>

            
            {_.isArray(feature_tags) && _.isArray(submission_tags) && feature_tags.length === submission_tags.length ?
                <FeatureDataView feature_tags={feature_tags} submission_tags={submission_tags} showProteinNameInTitle={false} metrics={metrics} /> : null}

    

        </div>
        </div>

    </div>
}