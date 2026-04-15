

import _ from "lodash"
import { useMemo, useState } from "react"
import { NormalizationModes, NormalizationPrefixes, getAverageAndErrorByGroups, getQuantilesByGroups, groupListByProperty, normalizeDataToGroup } from "../../../../services/arrays/groupby"
import NormalizeIcon from "../../../core/svg/icons/chartSelection/Normalize"
import { useCycle } from "framer-motion"
import PlottypeIcon from "../../../core/svg/icons/chartSelection/Plottype"
import DownloadIcon from "../../../core/svg/icons/chartSelection/Download"
import { downloadTxtFile } from "../../../../services/downloads/txt"
import { arrayOfObjectsToString } from "../../../../services/arrays/transforms"
import { downloadSVG } from "../../../../services/downloads/svg"
import InfoIcon from "../../../core/svg/icons/chartSelection/Info"
import { Card } from "@blueprintjs/core"
import { useNavigate } from "react-router"
import { CategoricalChartSelection } from "./chartselection/CategoricalSelection"

import viz from "@mitocube/viz"
import { getConditionApplicationLabel} from "@/api/fetch/conditionApplications"

import { api } from "@/api"

function ResultChart({
    data = [{ "y": 24.2, Genotype: "WT", Treatment: "DMSO", Time: "00min" },
        { "y": 24.2, Genotype: "WT", Treatment: "Treat", Time: "15min" },
        { "y": 24.5, Genotype: "WT", Treatment: "DMSO", Time: "15min" },
        { "y": 24.6, Genotype: "KO", Treatment: "Treat", Time: "15min" },
        { "y": 25, Genotype: "KO", Treatment: "DMSO", Time: "00min" },
        { "y": 25.4, Genotype: "KO", Treatment: "DMSO", Time: "15min" },
        { "y": 25.2, Genotype: "KO", Treatment: "DMSO", Time: "15min" },
        { "y": 24.7, Genotype: "WT", Treatment: "DMSO", Time: "15min" },
        { "y": 24.3, Genotype: "WT", Treatment: "DMSO", Time: "00min" },
        { "y": 24, Genotype: "KO", Treatment: "DMSO", Time: "00min" },
        { "y": 24.2, Genotype: "WT", Treatment: "DMSO", Time: "00min" },
        { "y": 24.3, Genotype: "WT", Treatment: "DMSO", Time: "00min" },
        { "y": 23.4, Genotype: "WT", Treatment: "DMSO", Time: "15min" },
        { "y": 24, Genotype: "WT", Treatment: "DMSO", Time: "15min" },
        { "y": 24.55, Genotype: "KO", Treatment: "Treat", Time: "15min" },
        { "y": 24.3, Genotype: "KO", Treatment: "Treat", Time: "00min" },
        { "y": 23.2, Genotype: "WT", Treatment: "Treat", Time: "15min" },
        { "y": 23.5, Genotype: "WT", Treatment: "Treat", Time: "00min" }],
    yaxisName = "y",
    yAxisLabel = undefined,
    attribute_tags = [],
    submission_tag = "",
    featureID = "",
    width,
    height,
    title,
    showMenu = true,
    openMetadataDrawer
}) {


    
    const [chartType, cyclePlotTypes] = useCycle("boxplot", "barplot", "lineplot")
    const [normalization, setNormalization] = useState(NormalizationModes[0])
    const [normalizeDialog, setNormalizeDialog] = useState({ isOpen: false, normalizeToSelection: {} })
    const [selection, setSelection] = useState({colorName : attribute_tags[0], splitName : attribute_tags[1], subplotName : attribute_tags[2]})
    const keyNamesForSplitting = _.uniq(Object.values(selection).map(v => v))
    const selectionTags = selection

    const normalizedData = normalizeDataToGroup(data, normalizeDialog.normalizeToSelection, yaxisName, false, normalization)
    const showNormalizedData = normalizedData.length > 0 && normalization !== "raw"
    const svgID = `${featureID}-svg-id${submission_tag}`
    const redirect = useNavigate()
    
    const { groupedAggratedData, minMaxYDomain } = useMemo(() => {
        const chartData = showNormalizedData ? normalizedData : data
        if (chartType === "boxplot") {
            return getQuantilesByGroups(
                chartData,
                keyNamesForSplitting,
                [0, 0.25, 0.5, 0.75, 1],
                yaxisName,
                yaxisName)
        }
        else if (["barplot", "lineplot"].includes(chartType)) {
            //calculate average and standard deviation for lineplots and barplots.
            return getAverageAndErrorByGroups(chartData, keyNamesForSplitting, yaxisName)
        }
    }, [chartType, yaxisName, _.join(keyNamesForSplitting,"-"), data, normalization])




    const handleDataDownload = (dataType) => {
       
        if (dataType.text === "Raw") downloadTxtFile(arrayOfObjectsToString({ data, keyNames: Object.keys(data[0])}), `raw-${featureID}-${submission_tag}.txt`)
        else if (dataType.text === "Aggregated") downloadTxtFile(arrayOfObjectsToString({ data: groupedAggratedData, keyNames: Object.keys(groupedAggratedData[0]) }), `aggregatedData-${featureID}-${submission_tag}.txt`)
        else if (dataType.text === "Normalized") downloadTxtFile(arrayOfObjectsToString({ data: normalizedData, keyNames: Object.keys(normalizedData[0]) }), `normlizedData-${featureID}.txt`)
        else if (dataType === "PNG") console.log("asd") //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${submission_tag}).png`, imageOptions)
        else if (dataType.text === "SVG") downloadSVG(document.getElementById(`${svgID}`), `${featureID}-${submission_tag}.svg`) //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${submission_tag}).png`, imageOptions)
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
    

    const handleInfo = (infoType) => {
        //handle info request
        if (infoType === "Metadata") {
            openMetadataDrawer(prevValues => {return {...prevValues, isOpen : true, submission_tag : submission_tag}})
        }
        else {
            redirect("/submissions/"+submission_tag)
        }
        
    }

    

    return (
        <div
            className="margin--little"
            style={{ width: width, height: height }}
        >
            

            <div className="flex center-items">
                <h4>{title}</h4>
            </div>
            <div className="flex">

                <viz.charts.Categorical
                    getConditionApplicationText = {getConditionApplicationLabel}
                    width={width - 40 || undefined}
                    height={height - 50 || undefined}
                    {...selectionTags}
                    data={groupedAggratedData}
                    errorName="e"
                    yaxisLabel={_.isString(yAxisLabel) ? yAxisLabel : yaxisName}
                    yaxisName={yaxisName}
                    minMaxYDomain={minMaxYDomain}
                    svgID={svgID}
                    chartType={chartType}
                    tooltipNames={_.concat([{ text: "N", type: "default" }], keyNamesForSplitting.map((k) => { return { text: k, type: "attribute" } }))}
                />

            {showMenu && (
                <div className="flex flex-column justify-flex-start">
                    <CategoricalChartSelection
                        vertical={true}
                        {...{ keyNames: attribute_tags, selection, onSelectionChange: setSelection }}
                    />

                    <div>
                        <NormalizeIcon
                            placeholder=""
                            colorIdx={NormalizationModes.indexOf(normalization)}
                            items={_.concat(
                                NormalizationModes.map((v) => {
                                    return { text: v, selected: normalization === v, disabled: v !== "raw" && !checkNormalizeToSelection() }
                                }),
                                [{ text: "Normalize to .." }]
                            )}
                            callbackValueOnly={true}
                            callback={handleNormalization}
                        />
                    </div>
                    <PlottypeIcon callback={cyclePlotTypes} {...{ chartType }} />
                    <InfoIcon items={["Metadata", "Dataset view"]} callback={handleInfo} callbackValueOnly={true} />

                    <DownloadIcon
                        items={["Raw", "Aggregated", "Normalized", "DIVIDER", "PNG", "SVG"].map((dataType) => {
                            return { text: dataType, disabled: dataType === "Normalized" ? !(_.isArray(normalizedData) && normalizedData.length > 0) : false }
                        })}
                        placeholder=""
                        callback={handleDataDownload}
                        callbackValueOnly={true}
                    />
                </div>
                )}
                </div>
        </div>
    )
}

export default ResultChart