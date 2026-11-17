import { useOutletContext } from "react-router";
import _ from "lodash"
import { Tabs, Tab } from "@blueprintjs/core";
import { SamplePGCounts } from "./PGCounts";
import { QuantificationDistribution } from "./QuantificationDistribution";
import { ManipulationTargets } from "./ManipulationTargets";



function DatasetQC() {

    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { submission_tag, setTabHeader } = useOutletContext()   


    
    return (
        <div className="div--expand padding--medium margin--medium container--scroll-y-hide-x">
            <Tabs id="qc-tabs" defaultSelectedTabId="samples" renderActiveTabPanelOnly={true}>
                <Tab id="samples" title="Samples" panel={
                    <div>
                        <h3>Number of valid values in each sample</h3>
                        <SamplePGCounts tag={submission_tag} />
                        <QuantificationDistribution submission_tag={submission_tag} quantification_type="protein_groups" />
                    </div>} />
                <Tab id="targets" title="Target Proteins" panel={
                    <ManipulationTargets submission_tag={submission_tag} />} />
            </Tabs>
        </div>

    
    )

}


export default DatasetQC
