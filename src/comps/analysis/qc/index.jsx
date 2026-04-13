import { useOutletContext } from "react-router";
import _ from "lodash"
import ResultChart from "../../protein/charts/resultCard/chart";
import { useEffect } from "react";

import hooks from "@mitocube/api-hooks"
import { SamplePGCounts } from "./PGCounts";






function DatasetQC() {

    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { submission_tag, setTabHeader } = useOutletContext()   
    



    
    return (
        <div className="div--expand padding--medium margin--medium" style={{ overflowY: "scroll"}}>
            
            <h2>Basic metrices</h2>
            
            {/* <CategoricalBoxplot/> */}
            {/* <CategoricalBoxplot data={datatable} /> */}
            <h3>Number of valid values in each sample</h3>
            <SamplePGCounts tag={submission_tag} />
            {/* <LineChart
                data={featureCounts}
                xaxisName="idx"
                yaxisNames={["#valid"]}
                tooltipCircleNames={["#valid", "#valid (%)", "sampleName"]}
                yaxisStartsAtZero={true} /> */}
            {/* <h2>Intensity Distributions</h2> */}

            {/* <h2>Protein of interest</h2>
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
            })} */}
        </div>

       
    )


}


export default DatasetQC