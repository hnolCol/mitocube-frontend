import { useOutletContext } from "react-router";
import _ from "lodash"

import { AttributeFeatureTag, StaticDatasetAttributesHierarchy } from "../../submission/new/attribute/view/DatasetAttributesHierarchy";
import { QuickAccessBar } from "./Topbar";
import { ResearchAim } from "./Researchaim";
import { StateIndicator } from "../../core/base/states/SubmssionState";
import { SampleAttributesView } from "../../core/base/attributes/SampleAttributesView";
import { AuthorList } from "../../core/authors/AuthorList";
import { Metatexts } from "../../core/metatext/SubmissionMetatext";
import { SubmissionComments } from "../../submission/comments";
import { SubmissionTitle } from "../../submission/view/SubmissionTitle";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { SubmissionTag } from "../../submission/view/SubmissionTag";
import { SubmissionViews } from "../../submission/view/SubmissionViews";
import { SubmissionProteinCount } from "../../submission/view/SubmissionProteinCount";


/**
 * @description React element to give an overview about a Dataset/Submission. 
 * @param {Object} props  
 * @returns 
 */
function DatasetOverview() {

    const { submission_tag } = useOutletContext()    

    return (
        <div style={{ overflowY: "scroll", height: "100%" }}>
            <div className="flex justify-end intent-margin-right--little"><QuickAccessBar submission_tag={submission_tag}/></div>
             <div id="top" className="flex flex-column center-items">
                <div className="margin-top--little" style={{ maxWidth : "66vw"}}>
                    <h1><SubmissionTitle tag={submission_tag} /></h1>
                </div>
                
                <div className="margin-top--little">
                    <StateIndicator submission_tag={submission_tag}/>
                </div>
                
                <AuthorList {...{
                    submission_tag,
                    emailSubject : `Related to submission ${submission_tag}`
                }} />

                <div className="intent-margin-toplittle">
                {/* <MultipleMetrices metrices={datasetMetrices} /> */}
               
                <ResearchAim submission_tag={submission_tag}/>
                </div>


                

            </div>

            <div className="flex">
                <SubmissionTag {...{ submission_tag }} />
                <SubmissionViews {...{ submission_tag }} />
                <SubmissionProteinCount {...{ submission_tag }} />
                </div>
            
            <div className="flex flex--wrap">
                {/* {hasGenotypes ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Genotypes ({_.keys(metadata.genotypes).length})</h3>
                    <div className="flex flex-column div--expand padding--little">
                        {_.keys(metadata.genotypes).map(genotypeLabel => <GenotypeCard {...{ justDisplay: true, genotype: metadata.genotypes[genotypeLabel], fill: true }} />)}
                    </div>
                </div> : null} */}
                {_.isString(submission_tag) ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Sample Attributes</h3>
                    <SampleAttributesView submission_tag={submission_tag} minimal={false} />
                </div> : null}
            <div className="bg--lightgrey margin--medium padding--little" style={{maxWidth : "33vw", minWidth:"20vw", maxHeight: "min(50vh,500px)", overflowY:"scroll"}}>
                    <h3>Dataset Attributes</h3>
                    <ConditionApplicationsView />
                <StaticDatasetAttributesHierarchy submission_tag={submission_tag} />
                {/* <DatasetAttributeHierarchy {...{
                    selectedDasetAttributeValues: datasetAttributeValues,
                    selectedAttributes: dataAttributes
                    }} /> */}
                </div>
                {/* {_.has(metadata,"links") && metadata.links.length > 0 ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Links</h3>
                    {metadata.links.map(link => <div key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer"><strong>{titleFormat(link.comment)}</strong></a></div>)}
                </div> : null} */}
            </div>
            <div className="intent-margin-right ">
                <h3>Comments</h3>
                <SubmissionComments submission_tag={submission_tag}/>
            </div>

            <div className="intent-margin-right ">
            <h3>Metatext</h3>
                <div className="flex flex--wrap" style={{ gap: "2rem" }}>                    
                    <Metatexts {...{submission_tag}} />
                
                       
            </div>
                </div>
        </div>
        )}

export default DatasetOverview