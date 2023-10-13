

import _ from "lodash"
import { useMemo, useState } from "react"
import GroupingSelection, { getIcon } from "../../../core/base/groupings/selection"
import { NormalizationModes, NormalizationPrefixes, getAverageAndErrorByGroups, getQuantilesByGroups, normalizeDataToGroup } from "../../../../services/arrays/groupby"
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


function ResultChart({
    data = [{ "y": 24.2, Genotype: "WT", Treatment : "DMSO", Time : "00min"},{ "y": 24.2, Genotype: "WT", Treatment : "Treat", Time : "15min"},{ "y": 24.5, Genotype: "WT", Treatment : "DMSO", Time : "15min"}, { "y": 24.6, Genotype: "KO", Treatment : "Treat", Time : "15min"}, { "y": 25, Genotype: "KO", Treatment : "DMSO", Time : "00min"},{ "y": 25.4, Genotype: "KO", Treatment : "DMSO", Time : "15min"} ,{ "y": 25.2, Genotype: "KO", Treatment : "DMSO", Time : "15min"}, { "y": 24.7, Genotype: "WT" ,Treatment : "DMSO", Time : "15min" }, { "y": 24.3, Genotype: "WT" ,Treatment : "DMSO", Time : "00min" },{ "y": 24, Genotype: "KO" ,Treatment : "DMSO", Time : "00min" }, { "y": 24.2, Genotype: "WT" ,Treatment : "DMSO", Time : "00min" }, { "y": 24.3, Genotype: "WT" ,Treatment : "DMSO", Time : "00min" }, { "y": 23.4, Genotype: "WT"  ,Treatment : "DMSO", Time : "15min" }, { "y": 24, Genotype: "WT"  ,Treatment : "DMSO", Time : "15min" }, { "y":24.55, Genotype: "KO",  Treatment : "Treat", Time : "15min"  }, { "y": 24.3, Genotype: "KO", Treatment : "Treat" , Time : "00min"  }, { "y": 23.2, Genotype: "WT" , Treatment : "Treat" , Time : "15min" }, { "y": 23.5, Genotype: "WT", Treatment : "Treat", Time : "00min" }],
    yaxisName = "y",
    groupings = { Genotype: { KO: ["KO_01", "KO_02"], WT: ["WT1", "WT2"] }, Treatment: { DMSO: [], Treat: [] }, Time: { "00min": [], "15min": [] } },
    dataID = "",
    featureID = ""
}) {
    const groupingNames = useMemo(() => Object.keys(groupings), [groupings])
    const [plotType, cyclePlotTypes] = useCycle("boxplot","barplot","lineplot")
    const [normalization, setNormalization] = useState(NormalizationModes[0])
    const [normalizeDialog, setNormalizeDialog] = useState({ isOpen: false, normalizeToSelection: {} })
    const [selectedGroupings, setSelectedGroupings] = useState({colorName : groupingNames[0], splitName : groupingNames[1], subplotName : groupingNames[2]})

    const keyNamesForSplitting = _.uniq(Object.values(selectedGroupings).filter(v => v !== undefined && _.has(data[0], v)))
    console.log(data, normalizeDialog.normalizeToSelection, yaxisName, false, normalization)
    const normalizedData = normalizeDataToGroup(data, normalizeDialog.normalizeToSelection, yaxisName, false, normalization)
    const showNormalizedData = normalizedData.length > 0 && normalization !== "raw"
    const numberGroupings = groupingNames.length 
    const svgID = `${featureID}-svg-id${dataID}`

    
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
    }, [plotType, yaxisName, keyNamesForSplitting, data, normalization])

    const handleDataDownload = (dataType) => {

        if (dataType === "Raw") downloadTxtFile(arrayOfObjectsToString(data, Object.keys(data[0])), `rawData-${featureID}.txt`)
        else if (dataType === "Aggregated") downloadTxtFile(arrayOfObjectsToString(groupedAggratedData, Object.keys(groupedAggratedData[0])), `aggregatedData-${featureID}.txt`)
        else if (dataType === "Normalized") downloadTxtFile(arrayOfObjectsToString(normalizedData, Object.keys(normalizedData[0])), `normlizedData-${featureID}.txt`)
        else if (dataType === "PNG") console.log("asd") //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${dataID}).png`, imageOptions)
        else if (dataType === "SVG") downloadSVG(document.getElementById(`${svgID}`), `${featureID}-${dataID}.svg`) //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${dataID}).png`, imageOptions)
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
                ...selectedGroupings,
                data: groupedAggratedData,
                errorName: "e",
                yaxisLabel: _.join([NormalizationPrefixes[normalization], yaxisName, normalization!=="raw"?`(${_.join(Object.values(normalizeDialog.normalizeToSelection),", ")})`:""]," "),
                yaxisName,
                //categoricalNames: keyNamesForSplitting,
                minMaxYDomain,
                svgID,
                tooltipNames: _.concat(["N"], keyNamesForSplitting),
                
            }} />
        }
        else if (plotType === "lineplot") {
            return <CategoricalLineplot {...{
                ...selectedGroupings,
                data: groupedAggratedData,
                yaxisLabel: _.join([NormalizationPrefixes[normalization], yaxisName, normalization!=="raw"?`(${_.join(Object.values(normalizeDialog.normalizeToSelection),", ")})`:""]," "),
                errorName: "e",
                yaxisName,
                svgID,
                //categoricalNames: keyNamesForSplitting,
                minMaxYDomain,
                tooltipNames: _.concat(["N"], keyNamesForSplitting)
            }} />
        }
        else if (plotType === "boxplot") {
            return <CategoricalBoxplot {...{
                ...selectedGroupings,
                data: groupedAggratedData,
                yaxisLabel: _.join([NormalizationPrefixes[normalization], yaxisName, normalization!=="raw"?`(${_.join(Object.values(normalizeDialog.normalizeToSelection),", ")})`:""]," "),
                errorName: "e",
                yaxisName,
                svgID,
                //categoricalNames: keyNamesForSplitting,
                minMaxYDomain,
                tooltipNames: _.concat(["N"], keyNamesForSplitting)
            }} />
        }
    }

    return (

        <div className="margin--medium" style={{maxWidth: "450px"}}>
            <SelectionDialog
                title="Normalization Group Selection"
                applyButtonDisabled={!checkNormalizeToSelection()}
                isOpen={normalizeDialog.isOpen}
                onApply={applyNormalization}
                onClose={() => setNormalizeDialog(prevValues => { return { ...prevValues, isOpen: false } })}>
                <div className="margin--medium">
                <p>Please select the groups that should be used for normalization.</p>
                <div className="flex justify-space-around margin--medium">
                {_.isObject(selectedGroupings)?Object.keys(selectedGroupings).map(selectedGrouping => {
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
            </SelectionDialog>

            <div className="flex justify-flex-start flex--wrap">
            <div>
                <GroupingSelection
                    groupings={groupings}
                    keyNames={["colorName", "splitName", "subplotName"].slice(0, numberGroupings)}
                    handleSelection={(name,value) => setSelectedGroupings(prevValues => { return { ...prevValues, [name] : _.has(data[0],value)?value:undefined}})}
                    selectedItems={selectedGroupings} />
            </div>
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
            
                <DownloadIcon items={["Raw", "Aggregated", "Normalized","DIVIDER","PNG","SVG"].map(dataType => {
                    return ({ text: dataType, disabled: dataType === "Normalized" ? !(_.isArray(normalizedData) && normalizedData.length > 0 ): false})
                })} placeholder="" callback={handleDataDownload} callbackValueOnly={true} />
            </div>
            
                {getPlot(plotType, groupedAggratedData)}








        </div>

    )
}

export default ResultChart