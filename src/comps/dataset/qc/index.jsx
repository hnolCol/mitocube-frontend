import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import CategoricalBoxplot from "../../core/charts/categorical/boxplot";
import { useGetDataQC } from "../../../hooks/queries/datasets.hooks";
import LineChart from "../../core/charts/linechart";
import Loading from "../../core/base/loading";
import _ from "lodash"
import ResultChart from "../../protein/charts/resultCard/chart";
import { useEffect } from "react";




function DatasetQC() {
    
    const { dataset_label, metadata, refetchMetaData, setTabHeader } = useOutletContext()   

    const { data: datatable, isLoading, isFetching, isError, error } = useGetDataQC({ dataset_label })
    
    useEffect(() => {
        if (_.isObject(metadata) && _.has(metadata, "title")) {
            setTabHeader(metadata.title)
        }
    }, [_.isObject(metadata)])

    if (isError) return <APIError error={error}/>
    if (isLoading || isFetching) return <Loading />

    const featureCounts = _.keys(datatable.stats).map((sampleName, idx) => {
        return {
            "#valid": datatable.stats[sampleName].count, idx, sampleName,
            "#valid (%)": _.toString(_.round(datatable.stats[sampleName].count / datatable.stats[sampleName].total * 1000) / 10)+" %"
        }
    })

    return (
        <div style={{ overflowY: "scroll", height: "80vh " }}>
            <h2>Quality Control</h2>
            <h2>Basic metrices</h2>
            {/* <CategoricalBoxplot/> */}
            {/* <CategoricalBoxplot data={datatable} /> */}
            <h3>Number of valid values</h3>
            <LineChart
                data={featureCounts}
                xaxisName="idx"
                yaxisNames={["#valid"]}
                tooltipCircleNames={["#valid", "#valid (%)", "sampleName"]}
                yaxisStartsAtZero={true} />
            <h2>Protein of interest</h2>
            {_.map(datatable.poi_data, ({ data, samples_attributes, annotations }, idx) => {
                return (
                    <div>
                        <h4>{annotations.protein_name}</h4>
                        <ResultChart data={data} groupings={samples_attributes} yaxisName="value" />
                    </div>
                )
            })}

            {/* <CategoricalBoxplot data={datatable.poi_data[0]} colorName={"Treatment"} yaxisName="value" splitName={"Gene Knock-down"}/> */}
        </div>
    )


}


export default DatasetQC