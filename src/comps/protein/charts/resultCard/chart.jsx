

import _ from "lodash"
import { useMemo, useState } from "react"
import GroupingSelection, { getIcon } from "../../../core/base/attribute_selection/Selection"
import { NormalizationModes, NormalizationPrefixes, getAverageAndErrorByGroups, getQuantilesByGroups, groupListByProperty, normalizeDataToGroup } from "../../../../services/arrays/groupby"
import CategoricalBarplot from "../../../core/charts/categorical/barplot"
import NormalizeIcon from "../../../core/svg/icons/chartSelection/Normalize"
import CategoricalBoxplot from "../../../core/charts/categorical/boxplot"
import { useCycle } from "framer-motion"
import PlottypeIcon from "../../../core/svg/icons/chartSelection/Plottype"
import DownloadIcon from "../../../core/svg/icons/chartSelection/Download"
import { downloadTxtFile } from "../../../../services/downloads/txt"
import { arrayOfObjectsToString } from "../../../../services/arrays/transforms"
import SelectionDialog from "../../../core/dialogs/Selection"
import CategoricalLineplot from "../../../core/charts/categorical/lineplot"
import { downloadSVG } from "../../../../services/downloads/svg"
import { useGetSubmissionAttributesByTag } from "../../../../hooks/queries/submission.hooks"
import Loading from "../../../core/base/loading"
import InfoIcon from "../../../core/svg/icons/chartSelection/Info"
import { CategoricalFeaturePlotSelection } from "./chartselection/CategoricalChartSelection"
import { Card } from "@blueprintjs/core"


function ResultChart({
    data = [{ "y": 24.2, Genotype: "WT", Treatment : "DMSO", Time : "00min"},{ "y": 24.2, Genotype: "WT", Treatment : "Treat", Time : "15min"},{ "y": 24.5, Genotype: "WT", Treatment : "DMSO", Time : "15min"}, { "y": 24.6, Genotype: "KO", Treatment : "Treat", Time : "15min"}, { "y": 25, Genotype: "KO", Treatment : "DMSO", Time : "00min"},{ "y": 25.4, Genotype: "KO", Treatment : "DMSO", Time : "15min"} ,{ "y": 25.2, Genotype: "KO", Treatment : "DMSO", Time : "15min"}, { "y": 24.7, Genotype: "WT" ,Treatment : "DMSO", Time : "15min" }, { "y": 24.3, Genotype: "WT" ,Treatment : "DMSO", Time : "00min" },{ "y": 24, Genotype: "KO" ,Treatment : "DMSO", Time : "00min" }, { "y": 24.2, Genotype: "WT" ,Treatment : "DMSO", Time : "00min" }, { "y": 24.3, Genotype: "WT" ,Treatment : "DMSO", Time : "00min" }, { "y": 23.4, Genotype: "WT"  ,Treatment : "DMSO", Time : "15min" }, { "y": 24, Genotype: "WT"  ,Treatment : "DMSO", Time : "15min" }, { "y":24.55, Genotype: "KO",  Treatment : "Treat", Time : "15min"  }, { "y": 24.3, Genotype: "KO", Treatment : "Treat" , Time : "00min"  }, { "y": 23.2, Genotype: "WT" , Treatment : "Treat" , Time : "15min" }, { "y": 23.5, Genotype: "WT", Treatment : "Treat", Time : "00min" }],
    yaxisName = "y",
    groupings = { Genotype: { KO: ["KO_01", "KO_02"], WT: ["WT1", "WT2"] }, Treatment: { DMSO: [], Treat: [] }, Time: { "00min": [], "15min": [] } },
    dataset_label = "",
    featureID = "",
    attributesByTag,
    attributeValuesByTag,
    genotypesByLabel,
    title,
    openMetadataDrawer
}) {
    //const { data: attributesByTag, isLoading, isFetching } = useGetSubmissionAttributesByTag({}, { staleTime: Infinity })
    const attributes = useMemo(() => Object.keys(groupings).map(attributeTag => attributesByTag[attributeTag]), [groupings])
    const [plotType, cyclePlotTypes] = useCycle("boxplot","barplot","lineplot")
    const [normalization, setNormalization] = useState(NormalizationModes[0])
    const [normalizeDialog, setNormalizeDialog] = useState({ isOpen: false, normalizeToSelection: {} })
    const [selection, setSelection] = useState({colorName : attributes[0], splitName : attributes[1], subplotName : attributes[2]})

    const keyNamesForSplitting = _.uniq(Object.values(selection).filter(v => _.isObject(v)).map(v => v.tag))
    const selectionTags = _.fromPairs(_.keys(selection).filter(selectionKey => _.isObject(selection[selectionKey])).map(selectionKey => [selectionKey ,selection[selectionKey].tag]))
    //console.log(data, normalizeDialog.normalizeToSelection, yaxisName, false, normalization)
    const normalizedData = normalizeDataToGroup(data, normalizeDialog.normalizeToSelection, yaxisName, false, normalization)
    const showNormalizedData = normalizedData.length > 0 && normalization !== "raw"
    const svgID = `${featureID}-svg-id${dataset_label}`

    
    const { groupedAggratedData, minMaxYDomain } = useMemo(() => {
        const chartData = showNormalizedData ? normalizedData : data
        if (plotType === "boxplot") {
            return getQuantilesByGroups(
                chartData,
                keyNamesForSplitting,
                [0, 0.25, 0.5, 0.75, 1],
                yaxisName,
                yaxisName)
        }
        else if (["barplot", "lineplot"].includes(plotType)) {
            //calculate average and standard deviation for lineplots and barplots.
            return getAverageAndErrorByGroups(chartData, keyNamesForSplitting, yaxisName)
        }
    }, [plotType, yaxisName, _.join(keyNamesForSplitting,"-"), data, normalization])

    const handleDataDownload = (dataType) => {
       
        if (dataType.text === "Raw") downloadTxtFile(arrayOfObjectsToString({ data, keyNames: Object.keys(data[0])}), `raw-${featureID}-${dataset_label}.txt`)
        else if (dataType.text === "Aggregated") downloadTxtFile(arrayOfObjectsToString({ data: groupedAggratedData, keyNames: Object.keys(groupedAggratedData[0]) }), `aggregatedData-${featureID}-${dataset_label}.txt`)
        else if (dataType.text === "Normalized") downloadTxtFile(arrayOfObjectsToString({ data: normalizedData, keyNames: Object.keys(normalizedData[0]) }), `normlizedData-${featureID}.txt`)
        else if (dataType === "PNG") console.log("asd") //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${dataset_label}).png`, imageOptions)
        else if (dataType.text === "SVG") downloadSVG(document.getElementById(`${svgID}`), `${featureID}-${dataset_label}.svg`) //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${dataset_label}).png`, imageOptions)
    }

    const handleNormalizationGroupSelection = (groupingName, groupName) => {
        var normalizeSelection = { ...normalizeDialog.normalizeToSelection }
        normalizeSelection[groupingName] = groupName
        setNormalizeDialog(prevValues => {return {...prevValues,normalizeToSelection : normalizeSelection}})
    }
    const checkNormalizeToSelection = () => {
        return _.every(keyNamesForSplitting, i => Object.keys(normalizeDialog.normalizeToSelection).includes(i))
    }

    const handleNormalization = (normMode) => {
        if (NormalizationModes.includes(normMode)) setNormalization(normMode)
        else {
            setNormalizeDialog(prevValues => { return { ...prevValues, isOpen : true}})
        }
    }

    const applyNormalization = () => {
        setNormalizeDialog(prevValues => { return { ...prevValues, isOpen: false } })
    }
    
    const getPlot = (plotType, groupedAggratedData) => { 
        if (keyNamesForSplitting.length === 0) return <div>Please select grouping names ...</div>

        if (plotType === "barplot") {
            return <CategoricalBarplot {...{
                ...selectionTags,
                data: groupedAggratedData,
                errorName: "e",
                yaxisLabel: _.join([NormalizationPrefixes[normalization], yaxisName, normalization!=="raw"?`(${_.join(Object.values(normalizeDialog.normalizeToSelection),", ")})`:""]," "),
                yaxisName,
                //categoricalNames: keyNamesForSplitting,
                minMaxYDomain,
                svgID,
                tooltipNames: _.concat(["N"], keyNamesForSplitting),
                attributesByTag,
                attributeValuesByTag,
                genotypesByLabel
                
            }} />
        }
        else if (plotType === "lineplot") {
            return <CategoricalLineplot {...{
                ...selectionTags,
                data: groupedAggratedData,
                yaxisLabel: _.join([NormalizationPrefixes[normalization], yaxisName, normalization!=="raw"?`(${_.join(Object.values(normalizeDialog.normalizeToSelection),", ")})`:""]," "),
                errorName: "e",
                yaxisName,
                svgID,
                //categoricalNames: keyNamesForSplitting,
                minMaxYDomain,
                tooltipNames: _.concat(["N"], keyNamesForSplitting),
                attributesByTag,
                attributeValuesByTag,
                genotypesByLabel
            }} />
        }
        else if (plotType === "boxplot") {
            return <CategoricalBoxplot {...{
                ...selectionTags,
                data: groupedAggratedData,
                yaxisLabel: _.join([NormalizationPrefixes[normalization], yaxisName, normalization!=="raw"?`(${_.join(Object.values(normalizeDialog.normalizeToSelection),", ")})`:""]," "),
                errorName: "e",
                yaxisName,
                svgID,
                //categoricalNames: keyNamesForSplitting,
                minMaxYDomain,
                tooltipNames: _.concat(["N"], keyNamesForSplitting),
                attributesByTag,
                attributeValuesByTag,
                genotypesByLabel
            }} />
        }
    }

    return (
        <Card className="margin--little" compact={true} style={{maxWidth: "450x"}}>
            
            {/* <SelectionDialog
            <div className="margin--medium" style={{maxWidth: "450px"}}>
                title="Normalization Group Selection"
                applyButtonDisabled={!checkNormalizeToSelection()}
                isOpen={normalizeDialog.isOpen}
                onApply={applyNormalization}
                onClose={() => setNormalizeDialog(prevValues => { return { ...prevValues, isOpen: false } })}>
                <div className="margin--medium">
                <p>Please select the groups that should be used for normalization.</p>
                <div className="flex justify-space-around margin--medium">
                {_.isObject(selection)?Object.keys(selection).map(selectedGrouping => {
                    const Icon = getIcon(selectedGrouping)
                    const groupingName = selectedGroupings[selectedGrouping]
                    if  (!_.has(groupings,groupingName)) return null 
                    const items = Object.keys(groupings[groupingName])
                    if (!_.isArray(items)) return null
                    return (
                        <div className="flex">
                            <Icon
                                items={items}
                                placeholder={normalizeDialog.normalizeToSelection[groupingName]}
                                callback={handleNormalizationGroupSelection}
                                callbackKey={groupingName} />
                        </div>
                    )
                }):null}
                    </div>
                    </div>
            </SelectionDialog> */}

            <div className="flex justify-flex-start flex--wrap">
                <h4></h4>
                <CategoricalFeaturePlotSelection {...{keyNames : attributes , selection, onSelectionChange : setSelection, minimal : true} }/>
            {/* <div>
                <GroupingSelection
                    groupings={groupings}
                    keyNames={["colorName", "splitName", "subplotName"]}
                    handleSelection={(name,value) => setSelectedGroupings(prevValues => { return { ...prevValues, [name] : _.has(data[0],value)?value:undefined}})}
                    selectedItems={selectedGroupings} />
            </div> */}
                
                <div>
                    <NormalizeIcon
                        placeholder=""
                        colorIdx={NormalizationModes.indexOf(normalization)}
                        items={_.concat(NormalizationModes.map(v => { return { text: v, selected: normalization === v, disabled: v !== "raw" && !checkNormalizeToSelection() } }), [{text : "Normalize to .."}])}
                        callbackValueOnly={true}
                        callback={handleNormalization}
                        />
                </div>
                <PlottypeIcon callback={cyclePlotTypes} {...{ plotType }} />
                <InfoIcon items={["Metadata","Dataset view"]} callback={() => openMetadataDrawer(prevValues => {return {...prevValues, isOpen : true, dataset_label : dataset_label}})}/>

            
                <DownloadIcon items={["Raw", "Aggregated", "Normalized","DIVIDER","PNG","SVG"].map(dataType => {
                    return ({ text: dataType, disabled: dataType === "Normalized" ? !(_.isArray(normalizedData) && normalizedData.length > 0 ): false})
                })} placeholder="" callback={handleDataDownload} callbackValueOnly={true} />

                <div className="flex center-items">
                    
                    <h5>{title}</h5>
                    
                </div>
            </div>
            
                {getPlot(plotType, groupedAggratedData)}

        </Card>

    )
}

export default ResultChart