

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
import { useNavigate } from "react-router"
import { CategoricalChartSelection } from "./chartselection/CategoricalSelection"

import viz from "@mitocube/viz"

import { usePrefetchConditionApplicationTexts } from "@/api/orchestrated/conditionApplications"
import { usePrefetchAttributes } from "@/api/orchestrated/attributes"


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
    yAxisLabel = "log2 intensity",
    attribute_tags = [],
    submission_tag = "",
    featureTag = "",
    width,
    height,
    title,
    showMenu = true,
    openMetadataDrawer
}) {

    const [chartType, cyclePlotTypes] = useCycle("boxplot", "barplot", "lineplot")
    const [normalization, setNormalization] = useState(NormalizationModes[0])
    // const [normalizeDialog, setNormalizeDialog] = useState({ isOpen: false, normalizeToSelection: {} })
    const [selection, setSelection] = useState({colorName : attribute_tags[0], splitName : attribute_tags[1], subplotName : attribute_tags[2]})
    const keyNamesForSplitting = _.uniq(Object.values(selection).map(v => v))
    const selectionTags = selection

    // const ca_tags = _.uniq(_.values(selection).filter(attribute_tag => _.isString(attribute_tag) && _.has(data[0], attribute_tag)).map(attribute_tag => data.map(d => d[attribute_tag])).flat())
    
    const ca_tags = useMemo(() => {
        if (data.length === 0 || _.isEmpty(selection)) return []
        return _.uniq(
            _.values(selection)
            .filter(attr => _.isString(attr) && _.has(data[0], attr))
                .flatMap(attr => data.map(d => d[attr]))
                .map(ca_tag => ca_tag.includes(";") ? ca_tag.split(";") : ca_tag) // handle multiple CA tags in one string separated by ";"
                .flat()
            .filter(Boolean)
        );
        }, [_.join(_.values(selection), "-"), featureTag, submission_tag, _.isArray(data) ? data.length : 0]) // we need to include featureTag and submission_tag in the dependency array, because the CA tags are derived from the selection which is reset when feature or submission changes.;

    const { isReady, tagQueries } = usePrefetchConditionApplicationTexts(ca_tags)

    const map = new Map()
    tagQueries.forEach((q, idx) => {
        const ca_tag = ca_tags[idx]
        if (q.data) map.set(ca_tag, q.data)
    })


    const { isReady: attributesReady, tagQueries: attributeQueries } = usePrefetchAttributes(attribute_tags)
    const attributeMap = new Map()
    attributeQueries.forEach((q, idx) => {
        const attr_tag = attribute_tags[idx]
        if (q.data) attributeMap.set(attr_tag, q.data.text) // we only need the text for attributes, as they are used for labelling and not for grouping like CA tags.
    })

    // const nomalizedData = normalizeDataToGroup(data, normalizeDialog.normalizeToSelection, yaxisName, false, normalization)
    // const showNormalizedData = normalizedData.length > 0 && normalization !== "raw"


    const svgID = `${featureTag}-svg-id${submission_tag}`
    const redirect = useNavigate()
    
    const { groupedAggratedData, minMaxYDomain } = useMemo(() => {
        const chartData = data
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
       
        if (dataType.text === "Raw") downloadTxtFile(arrayOfObjectsToString({ data, keyNames: Object.keys(data[0])}), `raw-${featureTag}-${submission_tag}.txt`)
        else if (dataType.text === "Aggregated") downloadTxtFile(arrayOfObjectsToString({ data: groupedAggratedData, keyNames: Object.keys(groupedAggratedData[0]) }), `aggregatedData-${featureTag}-${submission_tag}.txt`)
        // else if (dataType.text === "Normalized") downloadTxtFile(arrayOfObjectsToString({ data: normalizedData, keyNames: Object.keys(normalizedData[0]) }), `normlizedData-${featureTag}.txt`)
        // else if (dataType === "PNG") console.log("asd") //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${submission_tag}).png`, imageOptions)
        else if (dataType.text === "SVG") downloadSVG(document.getElementById(`${svgID}`), `${featureTag}-${submission_tag}.svg`) //saveSvgAsPng.saveSvgAsPng(document.getElementById(`${svgID}`), `FeatureImage-(${proteinID}-${submission_tag}).png`, imageOptions)
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
            

            <div className="flex center-items" >
                <h4>{title}</h4>
                {showMenu && (
                    <div className="flex" style={{ gap: "5px"}}>
                        <CategoricalChartSelection
                            vertical={false}
                            {...{ keyNames: attribute_tags, selection, onSelectionChange: setSelection }}
                        />
                        <PlottypeIcon callback={cyclePlotTypes} {...{ chartType }} />
                        <InfoIcon items={["Metadata", "Dataset view"]} callback={handleInfo} callbackValueOnly={true} />
                        <DownloadIcon
                            items={["Raw", "Aggregated", "DIVIDER", "PNG", "SVG"].map((dataType) => {
                                return { text: dataType }
                            })}
                            placeholder=""
                            callback={handleDataDownload}
                            callbackValueOnly={true}
                        />
                    </div>
                )}
            </div>
            <div className="flex" style={{ height : height - 35}}>

                {isReady && attributesReady? <viz.charts.Categorical
                    width={width - 0 || undefined}
                    height={height - 0 || undefined}
                    margins={{ left: 50, right:10, top: 20, bottom: 100 }}
                    {...selectionTags}
                    data={groupedAggratedData}
                    errorName="e"
                    yaxisLabel={_.isString(yAxisLabel) ? yAxisLabel : yaxisName}
                    yaxisName={yaxisName}
                    minMaxYDomain={minMaxYDomain}
                    svgID={svgID}
                    chartType={chartType}
                    caTagToText={map}
                    attributeTagToText={attributeMap}
                    tooltipNames={_.concat([{ text: "N", type: "default" }], keyNamesForSplitting.map((k) => { return { text: k, type: "attribute" } }))}
                /> : <span>Attributes loading not complete..</span>}

                </div>
        </div>
    )
}

export default ResultChart