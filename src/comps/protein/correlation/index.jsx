

import _, { findLastKey, isError } from "lodash" 

// import ResultChart from "../resultCard/chart"

import viz from "@mitocube/viz"
import { api } from "@/api";
import { useSearchParams } from "react-router-dom";
import { OptionButton } from "../../core/base/buttons/OptionButton";
import { FeatureProfile } from "./FeatureProfile";
import { AnnotationSelectionMenu } from "../../core/base/annotations/AnnotationSelectionMenu";
import { Loading } from "../../core/base/states/Loading";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { useState } from "react";
import APIError from "../../core/error/APIerror";
import { FeatureCorrelationPlot } from "../../core/charts/correlation/FeatureCorrelationPlot";

const LIMITS = [5, 10, 20, 100, "None"];
const MIN_DATA_POINTS = [8, 10, 50, 100, 500]
const DIRECTIONS = ["positive", "negative", "both"]
const VIEW_OPTIONS = ["scatter", "sample"]
const FDR_CUTOFFS = ["0.001", "0.01", "0.05"]
/**
 * @description The protein correlation visualization of a feature tag. 
 * @param {Object} param0 
 * @returns 
 */
export function ProteinCorrelation({ tag }) {

    const [searchParams, setSearchParams] = useSearchParams();
    const [dataUpdated, setDataUpdated] = useState(undefined)
    const limit = LIMITS.includes(Number(searchParams.get("limit"))) ? Number(searchParams.get("limit")) : LIMITS[LIMITS.length - 1];
    const min_data_points = MIN_DATA_POINTS.includes(Number(searchParams.get("min_data_points"))) ? Number(searchParams.get("min_data_points")) : MIN_DATA_POINTS[0];
    const direction = DIRECTIONS.includes(searchParams.get("direction")) ? searchParams.get("direction") : DIRECTIONS[2]
    const selected_annotation_tags = searchParams.get("annotation_tag") ? searchParams.get("annotation_tag").split(";") : []
    const selectedProteinTags = searchParams.get("selected_protein_tags") ? searchParams.get("selected_protein_tags").split("|") : []
    const fdr_cutoff = searchParams.get("fdr") && FDR_CUTOFFS.includes(searchParams.get("fdr")) ? searchParams.get("fdr") : FDR_CUTOFFS[0] 
    const annotation_tags = selected_annotation_tags.length > 0 ? _.join(selected_annotation_tags, ";") : undefined

    const { data: feature, isSuccess } = api.features.proteinsQuery.useGetProteinByTag({ tag }, { enabled: _.isString(tag) })

    const { data, isLoading, isFetching, isError, error } = api.features.correlations.useGetFeatureCorrelation({
        tag,
        annotation_tags,
        min_data_points,
        limit: limit === "None" ? undefined : limit,
        direction,
        fdr : fdr_cutoff
    }, { enabled: _.isString(tag), onSuccess : (data) => setDataUpdated(Math.random()) })


    const updateParam = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === "" || value === undefined || value === null) {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        setSearchParams(newParams, { replace: true });
    };

    /**
     * 
     * @param {Set<string>} feature_tags 
     * @returns 
     */
    const handleFeatureSelection = (feature_indcs) => {
        if (feature_indcs === undefined || feature_indcs === null) return 
        if (feature_indcs.size === 0) return 
        if (!_.isArray(data) || data.length === 0) return
        let newSelected = []
        const feature_tags = Array.from(feature_indcs).map(idx => data[idx]["tag"]
        )

        if (_.every(feature_tags, tag => selectedProteinTags.includes(tag))) {
            newSelected = selectedProteinTags.filter(tag => !feature_tags.includes(tag))
        } else {
            const validFeatureTags = feature_tags.filter(tag => _.isString(tag));
            if (validFeatureTags.length === 0) return;

            const allAlreadySelected = validFeatureTags.every(tag => selectedProteinTags.includes(tag));
            if (allAlreadySelected) return;
            newSelected = _.concat(selectedProteinTags, validFeatureTags) 
            
        }
        
        updateParam("selected_protein_tags", _.join(_.uniq(newSelected), "|"))
    }


    return <div style={{width : "95vw", height : "90vh", display : "grid", overflow: "hidden", gridTemplateColumns : "max(15vw,400px) 1fr"}}>
        
        
        <div style={{ width : "100%"}}>
        <h3>Correlation to {isSuccess ? feature.gene_name : null}</h3>
        <h4>Setting</h4>
        <div className="flex flex-column" style={{gap : "0.75rem"}}>
        
        
        <div>
            <span>Min data points| </span>
            {MIN_DATA_POINTS.map(option => (
            <OptionButton
                key={option}
                isSelected={option === min_data_points}
                onClick={() => updateParam("min_data_points", option)}
            >
                <span>{option}</span>
            </OptionButton>
        ))} 
        
        </div>
        
        <div>
            <span>Direction | </span>
            {DIRECTIONS.map(option => (
            <OptionButton
                key={option}
                isSelected={option === direction}
                onClick={() => updateParam("direction", option)}
            >
                <span>{option}</span>
            </OptionButton>
        ))} 
        
        </div>

        <div>
            <span>FDR | </span>
            {FDR_CUTOFFS.map(option => (
            <OptionButton
                key={option}
                isSelected={option === fdr_cutoff}
                onClick={() => updateParam("fdr", option)}
            >
                <span>{option}</span>
            </OptionButton>
        ))} 
        
        </div>
        <div>
            <span>Limit | </span>
            {LIMITS.map(option => (
            <OptionButton
                key={option}
                isSelected={option === limit}
                onClick={() => updateParam("limit", option)}
            >
                <span>{option}</span>
            </OptionButton>
        ))} 
        </div>
       

        <div className="flex center-items" style={{gap : "1rem"}}>
            <span>Annotations |  </span>
            <AnnotationSelectionMenu placeholder="Select annotation" selected_tags={selected_annotation_tags}  showTags={true} onSelection={(e,tag) => updateParam("annotation_tag", tag)} onRemove={() => updateParam("annotation_tag",undefined)}/>
        </div>
        </div>
        </div>

        <div style = {{marginRight : "2rem"}}>
        {isLoading || isFetching ? <Loading /> : null}
        {isError ? <APIError error={error} /> : null}
        {isSuccess && _.isArray(data) && data.length == 0? <div><h2>No correlation data found.</h2></div> : null }

        {_.isArray(data) && data.length > 0 ? <InteractiveChart
            data={data}
            keyNames={[
                {
                    xaxisName: "t",
                    yaxisName: "pearson",
                }]}
                dataName={`${fdr_cutoff}-${tag}-${direction}-${limit}-${min_data_points}-${annotation_tags}`}
                dataUpdateTrigger={dataUpdated}
                onLabelDataChange={(idcs => handleFeatureSelection(idcs))}
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
                    hoverProps,
                    filterProps,
                    findClosestPoint,
                    labelProps
                }, didx) => {
                   
                    
                    return (
                        <div className="flex" key={`correlation_over-view-${chartIdx}-container`}>
                        <ScatterPlot key={`correlation_over-view-${chartIdx}-scatter`}{...{
                            chartIdx,
                            colorName: "t",
                            labelNames: ["gene_name"],   
                            legendWithAttributes : false,
                            data,
                            valid,
                            findClosestPoint,
                            findDataInRectangle,
                            setHoverDataInRectangle,
                            xaxisName,
                            yaxisName,
                            limits,
                            tooltipSmall: true,
                            tooltipNames: ["tag","pearson", "t", "N"],
                            ...hoverProps,
                            ...filterProps,
                            legend: true,
                            svgID: "scatter_plot-corr",
                            labelRenderer : labelProps.labelRenderer,
                            tooltipNameIsFeature: { "tag" : true },
                            tooltipNameIsNumeric: { "pearson": 2, "t": 2, "N": 0 },
                            ...labelProps
                        }} />
                            <FeatureProfile tag={tag} data={data} hoverProps={hoverProps} filterProps={filterProps} labelProps={labelProps} limits={limits} />
                            </div>
                    )
                })
                    }
                
        </InteractiveChart> : null}
        <div className="flex" style={{flexWrap : "wrap", justifyContent : "flex-start",  width : "100%", height : "50vh", alignItems : "flex-start", overflowY : "scroll"}}>
                    {_.isArray(selectedProteinTags) && selectedProteinTags.length > 0 ?
                        selectedProteinTags.map(proteinTag => (

                            <FeatureCorrelationPlot
                                key={`${tag}-${proteinTag}-feature-corr`}
                                feature_tag_x={tag}
                                feature_tag_y={proteinTag}
                                 />
            )) : null}
            </div>
            </div>
            </div>
}



