import { useOutletContext } from "react-router";
import _ from "lodash"
import { SamplePGCounts } from "./PGCounts";
import { QuantificationDistribution } from "./QuantificationDistribution";






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
            <QuantificationDistribution submission_tag={submission_tag} quantification_type="protein_groups" />
            {/* <LineChart
                data={featureCounts}
                xaxisName="idx"
                yaxisNames={["#valid"]}
                tooltipCircleNames={["#valid", "#valid (%)", "sampleName"]}
                yaxisStartsAtZero={true} /> */}
            {/* <h2>Intensity Distributions</h2> */}

           
        </div>

       
    )


}


export default DatasetQC