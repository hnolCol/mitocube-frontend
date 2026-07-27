import _ from "lodash"
import InteractiveChart from "../../core/charts/interactive"
import { useOutletContext } from "react-router"
import { Network } from "../../core/charts/scatter/Network"
import { useState, useEffect, useMemo } from "react"
import APIError from "../../core/error/APIerror"
import { ScatterDataSelection } from "../../core/charts/selections/ScatterDataSelection"
import { api } from "@/api";
import { AnnotationGroupSelectionMenu } from "./AnnotationGroupSelection"
import { ConditionApplicationSelection } from "../../core/base/attribute_selection/Pairwise"
import { PersistentCollapse } from "@/comps/core/base/collapse/Collapse"
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette"
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage"


export function MitomapNetwork({ }) {

    const { submission_tag } = useOutletContext() 
    const [networkProps, setNetworkProps] = useState({ type: "pathway", comp_type: "pairwise", statProps: {} })
    const [selectedAnnotationGroupTag, setSelectedAnnotationGroupTag] = useState(undefined)
    const [pairwiseTestParams, setPairwiseTestParams] = useState(undefined)
    const [pairwiseOpen, setPairwiseOpen] = useState(true)
    
    const { data : network_data, isLoading, isFetching, isSuccess, isError, error } = api.submissions.analysis.useGetSubmissionAnnotationNetwork({
        tag: submission_tag, 
        annotation_group_tag: selectedAnnotationGroupTag
    }, {
        enabled: !_.isEmpty(submission_tag) && _.isString(selectedAnnotationGroupTag)
    })

    const { data: volcanoData, isSuccess: volcanoIsSuccess } = api.submissions.analysis.useGetSubmissionVolcano({
        tag: submission_tag,
        ca_tag_left: pairwiseTestParams?.ca_tag_left,
        ca_tag_right: pairwiseTestParams?.ca_tag_right,
        within_attribute_tags: pairwiseTestParams?.within_attribute_tags,
        within_ca_tags: pairwiseTestParams?.within_ca_tags
    }, {
        enabled: _.isObject(pairwiseTestParams) && _.isString(pairwiseTestParams?.ca_tag_left) && _.isString(pairwiseTestParams?.ca_tag_right)
    })

    const log2FCFieldName = volcanoIsSuccess && _.isObject(volcanoData) ? `log2FC ${volcanoData.suffix}` : undefined

    const log2FCByTag = useMemo(() => {
        if (!volcanoIsSuccess || !_.isObject(volcanoData) || !_.isArray(volcanoData.stats)) return {}
        const map = {}
        volcanoData.stats.forEach(row => {
            const value = row[log2FCFieldName] ?? row["log2FC"]
            const proteinTagsInGroup = _.isString(row.tag) ? row.tag.split(";") : [row.tag]
            proteinTagsInGroup.forEach(proteinTag => {
                map[proteinTag] = value
            })
        })
        return map
    }, [volcanoIsSuccess, volcanoData])

    const [selection, setSelection] = useState({ xaxisName: "x", yaxisName: "y", colorName : "node_type", tooltipNames : ["tag"], sizeName : undefined, textSearchNames : ["tag"] })
    const handleScatterSelection = (idx, selectionKey, keyName) => {
        setSelection(prevValues => {return {...prevValues,[selectionKey] : keyName}})
    }

    const handleAnnotationGroupSelection = (e, tag) => {
        setSelectedAnnotationGroupTag(tag)
        setPairwiseTestParams(undefined)
        setSelection(prev => ({ ...prev, colorName: "node_type" }))
    }

    const handlePairwiseConfirm = (props) => {
        const testParams = { ...props, tag: submission_tag }
        setPairwiseTestParams(testParams)

        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "volcanoProps", parseJson: true })
        saveInLocalStorage({
            itemName: "volcanoProps", itemValue: JSON.stringify({
                ...itemValue,
                [submission_tag]: itemFound && _.isObject(itemValue) && _.has(itemValue, submission_tag)
                    ? _.concat(itemValue[submission_tag], testParams)
                    : [testParams]
            })
        })
    }

    const network_dataValid = isSuccess && _.isObject(network_data) && _.has(network_data, "nodes")

    const enrichedNodes = network_dataValid
        ? network_data.nodes.map(node => {
            if (!log2FCFieldName || node.type !== "protein") return node
            return { ...node, [log2FCFieldName]: log2FCByTag[node.tag] }
        })
        : []

    const numericKeyNames = network_dataValid ? _.filter(_.keys(network_data.nodes[0]), keyName => _.isNumber(network_data.nodes[0][keyName])) : []
    const extraLimitNames = log2FCFieldName ? _.uniq([...numericKeyNames, log2FCFieldName]) : numericKeyNames

    useEffect(() => {
        if (log2FCFieldName) setSelection(prev => ({ ...prev, colorName: log2FCFieldName }))
    }, [log2FCFieldName])

    if (isLoading || isFetching) {
        return <div>Loading...</div>
    }

    return (<div className="div--expand" style={{overflowY:"scroll"}}>
        <div className="flex-column">
            <div className="margin-bottom--little" style={{ padding: "1rem" }}>
                <h4>Select Annotation Group</h4>
                <AnnotationGroupSelectionMenu 
                    selected_tags={_.isString(selectedAnnotationGroupTag) ? [selectedAnnotationGroupTag] : []} 
                    onSelection={handleAnnotationGroupSelection}
                    showTags={true}
                    placeholder="Select annotation group..."
                />
            </div>

            {!selectedAnnotationGroupTag ? (
                <div className="center-items" style={{ padding: "2rem" }}>
                    <span>Select an annotation group to view the network</span>
                </div>
            ) : (
                <>
                    <div className="margin-bottom--little" style={{ padding: "1rem", maxWidth: "500px" }}>
                        <button className="basic-button div--expand margin--little" style={pairwiseOpen ? { backgroundColor: HIGHLIGHT_COLOR, color: "white" } : {}}
                            onClick={() => setPairwiseOpen(prev => !prev)}>
                            <span>Pairwise Comparison</span>
                        </button>
                        <PersistentCollapse isOpen={pairwiseOpen} direction="vertical" duration={0.65}>
                            <div className="padding--medium">
                                <ConditionApplicationSelection
                                    submission_tag={submission_tag}
                                    onConfirm={handlePairwiseConfirm}
                                    reset_after_confirm={false}
                                    // minimal={true}
                                    showTable={true}
                                    showAnnotationSubset={false}
                                />
                            </div>
                        </PersistentCollapse>
                    </div>

                    {isError ? <APIError error={error}/> : null}

                    {network_dataValid ? 
                        <InteractiveChart
                            data={enrichedNodes}
                            extraLimitNames={extraLimitNames}
                            dataName={networkProps.type}
                            keyNames={[{ xaxisName: "x", yaxisName: "y" }]}
                            isPointChart={[true]}>
                            {
                                (chartData) => chartData.map(({
                                    data, chartIdx, xaxisName, yaxisName, valid, limits,
                                    findDataInRectangle, setHoverDataInRectangle, findClosestPoint,
                                    handleStringSearch, handleSearchByDataIndex, filterDataInKeyByValue,
                                    hoverProps, filterProps, labelProps, rerenderAxis,
                                    triggerResetAxis, setTriggerResetAxisZoom
                                }, didx) => {
                                return (
                                    <div key={chartIdx}>
                                        <ScatterDataSelection
                                            keyNames={_.keys(enrichedNodes[0])}
                                            {...{
                                                title : "Annotation Group Network",
                                                numericKeyNames: extraLimitNames,
                                                itemIsAttribute : false,    
                                                idx: 1,
                                                chartIdx,
                                                setTriggerResetAxisZoom,
                                                selection,
                                                setSelection : handleScatterSelection,
                                                handleStringSearch,
                                                downloadElements: ["network-scatter" + networkProps.type, enrichedNodes],
                                                elementNames: ["SVG","DIVIDER",`Nodes (n = ${enrichedNodes.length})`],
                                                fileNames: [`${submission_tag}-MitoMap.svg`,`${submission_tag}-Mitomap.txt`],
                                                elementTypes: ["svg", "data"]
                                            }} />
                                        <Network key={`${chartIdx}`}{...{
                                            width: 1100, height : 1100, chartIdx,
                                            colorName: selection.colorName,
                                            sizeName: undefined,
                                            data,
                                            linkIdcs : network_data.links,
                                            valid, findDataInRectangle, setHoverDataInRectangle,
                                            xaxisName, yaxisName, limits, rerenderAxis, findClosestPoint,
                                            tooltipSmall : true,
                                            tooltipNames: log2FCFieldName ? ["tag", log2FCFieldName] : ["tag"],
                                            tooltipNameIsNumeric: log2FCFieldName ? { [log2FCFieldName]: 2 } : {},
                                            labelNames : ["tag"],
                                            dataRerender : [networkProps.type, selectedAnnotationGroupTag, selection.colorName],
                                            ...hoverProps, ...filterProps, ...labelProps,
                                            triggerResetAxis, setTriggerResetAxisZoom,
                                            tooltipNameIsFeature: { "tag": true },
                                            legend: true,
                                            handleSearchByDataIndex, filterDataInKeyByValue,
                                            svgID : "network-scatter" + networkProps.type
                                        }} />
                                    </div>)
                                })}
                            </InteractiveChart> : null}
                </>
            )}
        </div>
    </div>)
}


