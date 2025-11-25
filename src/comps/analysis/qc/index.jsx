import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { useGetDataQC } from "../../../hooks/queries/datasets.hooks";
import LineChart from "../../core/charts/linechart";
import Loading from "../../core/base/loading";
import _ from "lodash"
import ResultChart from "../../protein/charts/resultCard/chart";
import { useEffect } from "react";





function DatasetQC() {

    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { submission_tag, metadata, setTabHeader } = useOutletContext()   
    const { data: datatable, isLoading, isFetching, isError, error } = useGetDataQC({ dataset_tag : submission_tag})
    
    useEffect(() => {
        if (_.isObject(metadata) && _.has(metadata, "title")) {
            setTabHeader(metadata.title)
        }
    }, [_.isObject(metadata)])

    if (isError) return <APIError error={error}/>
    if (isLoading || isFetching) return <Loading />
    if (!_.isObject(metadata)) return <Loading />
    const featureCounts = _.keys(datatable.stats).map((sampleName, idx) => {
        return {
            "#valid": datatable.stats[sampleName].count,
            idx,
            sampleName,
            "#valid (%)": _.toString(_.round(datatable.stats[sampleName].count / datatable.stats[sampleName].total * 1000) / 10)+" %"
        }
    })
    

    
    return (
        <div className="div--expand padding--medium margin--medium" style={{ overflowY: "scroll"}}>
            
            <h2>Basic metrices</h2>
            
            {/* <CategoricalBoxplot/> */}
            {/* <CategoricalBoxplot data={datatable} /> */}
            <h3>Number of valid values in each sample</h3>
            <LineChart
                data={featureCounts}
                xaxisName="idx"
                yaxisNames={["#valid"]}
                tooltipCircleNames={["#valid", "#valid (%)", "sampleName"]}
                yaxisStartsAtZero={true} />
            {/* <h2>Intensity Distributions</h2> */}

            <h2>Protein of interest</h2>
            <div className="flex flex-wrap intent-margin-bottom--large">
            {_.map(datatable.poi_data, ({ data, samples_attributes, annotations, feature_key, feature_annotations }, idx) => {
                return (
                    <div style={{maxWidth : "500px"}}>
                        <h4>{feature_annotations.genes}</h4>
                        <h5>{feature_annotations.protein_name}</h5>
                        <ResultChart
                            data={data}
                            groupings={samples_attributes}
                            yaxisName="value"
                            title={metadata.title}
                            attributesByTag={metadata.attributes}
                            attributeValuesByTag={metadata.attribute_values_by_tag}
                            genotypesByLabel={metadata.genotypes}/>
                    </div>
                )
            })}
            </div>

            {/* <CategoricalBoxplot data={datatable.poi_data[0]} colorName={"Treatment"} yaxisName="value" splitName={"Gene Knock-down"}/> */}
        </div>
    )


}


export default DatasetQC