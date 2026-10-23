



import _ from "lodash"
import { Button } from "@blueprintjs/core"
import InteractiveChart from "../../core/charts/interactive"
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection"
import { useEffect, useMemo, useState } from "react"
import { ScatterPlot } from "../../core/charts/scatter"

import { FeatureDataView } from "../../analysis/features/DataView"
import { RankingStats } from "../../core/base/submissions/RankingStats"
import { api } from "@/api";
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { ConditionApplicationFilter } from "@/comps/submission/filter/ConditionApplicationFilter"
import { UserDatasetFilter } from "@/comps/submission/filter/UserFilter"

const METRICES = ["log2_fc_vs_mean", "raw", "z_score_sample", "z_score_protein_group"]

const LOAD_STEP = 10

export function ProteinSubmissionRanking({ tag, N = 10 }) {
    const [selection, setSelection] = useState({ xaxisName: "eta_squared", yaxisName: "score", colorName: undefined, tooltipNames: [], sizeName: undefined, filterTag: undefined })
    const [metrics, setMetrics] = useState(METRICES[0])
    const [visibleCount, setVisibleCount] = useState(N)
    const [submissionFilter, setSubmissionFilter] = useState({ ca_tags: [], include_sample_ca: true, user: [] })
    const [hoveredSubmissionTag, setHoveredSubmissionTag] = useState(undefined)

    const handleHoverDataChange = (hoverData) => {
        const hoverTag = _.isArray(hoverData.hoverTags) && hoverData.hoverTags.length > 0 ? hoverData.hoverTags[hoverData.hoverTags.length - 1] : undefined
        setHoveredSubmissionTag(prev => prev === hoverTag ? prev : hoverTag)
    }

    useEffect(() => {
        setVisibleCount(N)
    }, [tag, N])
    const {data : submissionStats, isLoading} = api.features.ranking.useGetProteinGroupSubmissionStats(
        {tag,
        ca_tags: submissionFilter.ca_tags,
        include_sample_ca: submissionFilter.include_sample_ca,
        user_tags: (submissionFilter.user || []).map(u => u.tag)
        },
            { enabled: _.isString(tag) && tag.length > 0 }
        )

        console.log("submissionStats", submissionStats)
   
// export function ProteinSubmissionRanking({ tag, N = 10 }) {
//     const [selection, setSelection] = useState({ xaxisName: "eta_squared", yaxisName: "score", colorName: undefined, tooltipNames: [], sizeName: undefined, filterTag: undefined })
//     const [metrics, setMetrics] = useState(METRICES[0])
//     const {data : submissionStats} = api.features.ranking.useGetProteinGroupSubmissionStats({tag}, { enabled: _.isString(tag) && tag.length > 0 })
    const { feature_tags, submission_tags, totalSubmissions } = useMemo(() => {
        if (_.isArray(submissionStats) && submissionStats.length > 0) {
            const uniqueStats = _.uniqBy(_.orderBy(submissionStats, ["score"], ["desc"]), "submission_tag");
            const topStats = _.slice(uniqueStats, 0, visibleCount);
            return {
                feature_tags: topStats.map(stat => tag), //all the same feature tag, which is the one in the props
                submission_tags: topStats.map(stat => stat.submission_tag),
                totalSubmissions: uniqueStats.length
            };
        }
        return { feature_tags: [], submission_tags: [], totalSubmissions: 0 };
    }, [submissionStats, tag, visibleCount])

    const hasMoreSubmissions = totalSubmissions > feature_tags.length


    const numericKeyNames = _.isArray(submissionStats) && submissionStats.length > 0 ? _.filter(_.keys(submissionStats[0]), keyName => _.isNumber(submissionStats[0][keyName])) : []
    const handleSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => { return { ...prevValues, [selectionKey]: keyName } })
    }

    if (isLoading || !_.isArray(submissionStats)) {
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
    
    return <div style={{display : "flex", flexDirection : "column", height : "100%", minHeight : 0}}>
        <h3>Protein Submission Ranking</h3>
        <span>Features are ranked by statistic approaches. Find more information in the documentation.</span>
        <div className="flex" style={{gap : "3rem", marginTop : "1rem", flex : 1, minHeight : 0}}>
            <div className="flex flex-column" style={{width : "375px"}}>
                {submissionStats.length > 0 ? <InteractiveChart
            data={submissionStats}
            onHoverDataChange={handleHoverDataChange}
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
                        clearHoverData,
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

        
        </InteractiveChart> : <div>No submissions match the selected filters.</div>}
        
                <div>
                    <h3>Settings</h3>
                    <span>Choose metrics to display data.</span>
                    
                    <div className="flex" style={{ marginBottom: "0.75rem", flexShrink: 0, maxWidth : "100%", flexWrap : "wrap", gap : "0.5rem"}}>
                            {METRICES.map(option => (
                                <OptionButton key={option} onClick={() => setMetrics(option)} isSelected={option === metrics}>
                                    {option}
                                </OptionButton>
                            ))}
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                        <UserDatasetFilter
                            submissionFilter={submissionFilter}
                            setSubmissionFilter={setSubmissionFilter}
                            infoText="Features from submissions created or collaborated on by the selected user(s) will be displayed."
                        />
                    </div>
                    <ConditionApplicationFilter
                        submissionFilter={submissionFilter}
                        setSubmissionFilter={setSubmissionFilter}
                        infoText="Features from submissions with the selected condition applications will be displayed."
                    />
            
                
                </div>
            </div>

        <div style={{width : "100%", borderLeft : "1px solid #ccc", paddingLeft : "2rem", display : "grid", gridTemplateRows : "1fr 40px", rowGap : "0.5rem", height : "100%", minHeight : 0}}>
            <div style={{minHeight : 0, overflowY : "auto"}}>
                {_.isArray(feature_tags) && _.isArray(submission_tags) && feature_tags.length === submission_tags.length && feature_tags.length > 0 ?
                    <FeatureDataView feature_tags={feature_tags} submission_tags={submission_tags} showProteinNameInTitle={false} metrics={metrics} layoutStorageKey={`protein-${tag}`} highlightedSubmissionTag={hoveredSubmissionTag} />
                    : <div>
                        <span>No submissions match the selected filters.</span>
                    </div>}
            </div>
            <div style={{display : "flex", gap : "0.5rem", alignItems : "center"}}>
                {hasMoreSubmissions ? <>
                    <span>Showing {feature_tags.length} of {totalSubmissions} submissions.</span>
                    <Button intent="primary" variant="minimal" onClick={() => setVisibleCount(prev => prev + LOAD_STEP)} text="Load more" />
                    <Button intent="primary" variant="minimal" onClick={() => setVisibleCount(totalSubmissions)} text="Load all" />
                </> : null}
            </div>
        </div>
        </div>
    

    </div>
}