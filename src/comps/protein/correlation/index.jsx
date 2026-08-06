

import { api } from "@/api";
import { useSearchParams } from "react-router";
import { OptionButton } from "../../core/base/buttons/OptionButton";
import { FeatureProfile } from "./FeatureProfile";
import { AnnotationSelectionMenu } from "../../core/base/annotations/AnnotationSelectionMenu";
import { Loading } from "../../core/base/states/Loading";
import InteractiveChart from "../../core/charts/interactive";
import { ScatterPlot } from "../../core/charts/scatter";
import { useState } from "react";
import APIError from "../../core/error/APIerror";
import { FeatureCorrelationPlot } from "../../core/charts/correlation/FeatureCorrelationPlot";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";
import _ from "lodash";
import { ConditionApplicationFilter } from "@/comps/submission/filter/ConditionApplicationFilter";

const LIMITS = [5, 10, 20, 100, "None"];
const MIN_DATA_POINTS = [8, 10, 50, 100, 500]
const DIRECTIONS = ["positive", "negative", "both"]
const METRICS = [{value : "log2_fc_vs_mean", label : "log2 FC vs mean"}, {value : "raw", label : "raw"}, {value : "z_score_protein_group", label : "z-score protein group"}, {value : "z_score_sample", label : "z-score sample"}]
const VIEW_OPTIONS = ["scatter", "sample"]
const FDR_CUTOFFS = ["0.001", "0.01", "0.05"]


const explanations = {
    "raw" : "The raw abundance values of the feature in the sample. This metric is influenced by both the abundance of the feature and the fold change compared to other samples. Also between datasets there is a systematic difference in the raw abundance values, thus this metric is not comparable across datasets.",
    "log2_fc_vs_mean": "log2 fold change of the feature abundance in the sample compared to the mean abundance across all samples of the same dataset. This metrics helps maintains the fold change character but eliminates the abundance aspect.",
    "z_score_protein_group": "The z-score of the feature abundance in the sample compared to the mean abundance across all samples of the same dataset, where the standard deviation is calculated across all protein groups. This metric normalizes the data to have a mean of 0 and a standard deviation of 1 across all features, thus making it more comparable across datasets. However, it also eliminates the fold change character of the data.",
    "z_score_sample": "The z-score of the feature abundance in the sample compared to the mean abundance across all samples of the same dataset, where the standard deviation is calculated across all samples. This metric normalizes the data to have a mean of 0 and a standard deviation of 1 across a sample, thus making it more comparable across datasets. However, it also eliminates the fold change character of the data.",
    
}



export function ProteinCorrelationWrapper({ tag }) {
    const [requiredProteinTags, setRequiredProteinTags] = useState([tag])
        
        return <WithTagMaps
            Component={ProteinCorrelation}
            tag={tag}
            {...{setRequiredProteinTags}}
            protein_tags={requiredProteinTags}/>
    }


/**
 * @description The protein correlation visualization of a feature tag. 
 * @param {Object} param0 
 * @returns 
 */
export function ProteinCorrelation({ tag, setRequiredProteinTags, proteinTagMap, proteinIsLoading}) {


    const [searchParams, setSearchParams] = useSearchParams();
    const [dataUpdated, setDataUpdated] = useState(undefined)
    const limit = LIMITS.includes(Number(searchParams.get("limit"))) ? Number(searchParams.get("limit")) : LIMITS[LIMITS.length - 1];
    const min_data_points = MIN_DATA_POINTS.includes(Number(searchParams.get("min_data_points"))) ? Number(searchParams.get("min_data_points")) : MIN_DATA_POINTS[0];
    const direction = DIRECTIONS.includes(searchParams.get("direction")) ? searchParams.get("direction") : DIRECTIONS[2]
    const selected_annotation_tags = searchParams.get("annotation_tag") ? searchParams.get("annotation_tag").split(";") : []
    const selectedProteinTags = searchParams.get("selected_protein_tags") ? searchParams.get("selected_protein_tags").split("|") : []
    const fdr_cutoff = searchParams.get("fdr") && FDR_CUTOFFS.includes(searchParams.get("fdr")) ? searchParams.get("fdr") : FDR_CUTOFFS[0] 
    const metricValue = METRICS.map(m => m.value).includes(searchParams.get("metric")) ? searchParams.get("metric") : METRICS[0].value
    const annotation_tags = selected_annotation_tags.length > 0 ? _.join(selected_annotation_tags, ";") : undefined
    const selectedCATags = searchParams.get("selected_ca_tags") ? searchParams.get("selected_ca_tags").split("|") : []
    const { data: submissionCount } = api.submissions.query.useGetSubmissionQueryCount({ protein_tags: tag }, { enabled : _.isString(tag), staleTime: Infinity })

    const { data: submissionCountCaFilter } = api.submissions.query.useGetSubmissionQueryCount({ protein_tags: tag, ca_tags: _.join(selectedCATags,";") }, { enabled : _.isArray(selectedCATags) && selectedCATags.length > 0 && _.isString(tag), staleTime: Infinity })

    const { data: feature, isSuccess } = api.features.proteinsQuery.useGetProteinByTag({ tag }, { enabled: _.isString(tag) })

    const { data, isLoading, isFetching, isError, error } = api.features.correlations.useGetFeatureCorrelation({
        tag,
        annotation_tags,
        min_data_points,
        limit: limit === "None" ? undefined : limit,
        direction,
        fdr : fdr_cutoff,
        metrics: metricValue,
        ca_tags : _.isArray(selectedCATags) && selectedCATags.length > 0 ? _.join(selectedCATags, ";") : undefined
    }, { enabled: _.isString(tag), staleTime: Infinity })


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

    const handleCASelection = (ca_tags) => {
        
        updateParam("selected_ca_tags", _.join(ca_tags, "|"))
    }

   

    return <div style={{width : "95vw", height : "90vh", display : "grid", overflow: "hidden", gridTemplateColumns : "max(15vw,400px) 1fr"}}>
        
        
        <div style={{ width : "100%"}}>
        <h3>Correlation to {isSuccess ? feature.gene_name : null}</h3>
        <h4>Setting</h4>
        <div className="flex flex-column" style={{gap : "0.75rem"}}>
        
                <span>Protein quantified in <strong>{submissionCount?.query_count}</strong> submissions.</span>
                <span>Filter by specific conditions to refine the analysis. For example you can define a specific cell line.</span>
                <div className="flex flex-column" style={{gap : "1rem", width : "100%"}}>
                    <ConditionApplicationFilter setSubmissionFilter={handleCASelection} submissionFilter={{ ca_tags: selectedCATags, include_sample_ca : true }} return_tags_only={true} infoText="Only submission matching all condition applications will be used for correlation analysis." showIncludeSampleLevelOption={false} />
                    <span>Submissions matching selected condition applications: <strong>{submissionCountCaFilter?.query_count || 0}</strong></span>
        </div>
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
                
        <div>
            <span>Metrics | </span>
            {METRICS.map(option => (
            <OptionButton
                key={option.value}
                isSelected={option.value === metricValue}
                onClick={() => updateParam("metric", option.value)}
            >
                <span>{option.label}</span>
                </OptionButton>
            ))} 
                    <div className="font-size--smallest">{explanations?.[metricValue]}</div>
        </div>
       

        <div className="flex center-items" style={{gap : "1rem"}}>
            <span>Annotations |  </span>
                    <AnnotationSelectionMenu
                        placeholder="Select annotation"
                        selected_tags={selected_annotation_tags}
                        showTags={true}
                        protein_tags={[tag]}
                        onSelection={(e, tag) => updateParam("annotation_tag", tag)} onRemove={() => updateParam("annotation_tag", undefined)} />
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
                passOnProps = {{setRequiredProteinTags, proteinTagMap, proteinIsLoading}}
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
                    labelProps,
                    setRequiredProteinTags,
                    proteinTagMap,
                    proteinIsLoading
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
                            ...labelProps,
                            setRequiredProteinTags,
                            proteinTagMap,
                            proteinIsLoading,
                            labelIsProtein : true
                        }} />
                            <FeatureProfile tag={tag} data={data} hoverProps={hoverProps} filterProps={filterProps} labelProps={labelProps} limits={limits} metrics={metricValue} proteinTagMap={proteinTagMap} />
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
                                proteinTagMap={proteinTagMap}
                                 />
            )) : null}
            </div>
            </div>
            </div>
}



