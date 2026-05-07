import { useOutletContext } from "react-router";
import _ from "lodash"

import { QuickAccessBar } from "./Topbar";
import { ResearchAim } from "./Researchaim";
import { StateIndicator } from "../../core/base/states/SubmssionState";
import { AuthorList } from "../../core/authors/AuthorList";
import { Metatexts } from "../../core/metatext/SubmissionMetatext";
import { SubmissionTitle } from "../../submission/view/SubmissionTitle";
import { SubmissionTag } from "../../submission/view/SubmissionTag";
import { SubmissionViews } from "../../submission/view/SubmissionViews";
import { SubmissionProteinGroupCount } from "../../submission/view/SubmissionProteinGroupCount";
import { SubmissionUpload } from "../../submission/upload/SubmissionFeatureUpload";
import { SubmissionSampleCount } from "../../submission/view/SubmissionSampleCount";
import { SubmissionPeptideCount } from "../../submission/view/SubmissionPeptideCount";
import { SubmissionCommentCount } from "@/comps/submission/comments";
import { SubmissionConditionApplicationView } from "./SubmissionConditionApplicationView";
import { SubmissionDate } from "../../submission/view/SubmissionDate";
import { getColorPalette } from "@mitocube/viz/src/colors/palette";


/**
 * @description React element to give an overview about a Dataset/Submission. 
 * @param {Object} props  
 * @returns 
 */
function SubmissionOverview() {

    const { submission_tag } = useOutletContext()    
    const fontColors = getColorPalette(5)
    return (
        <div style={{ overflowY: "scroll", height: "85vh", padding: "1rem" }} className="flex flex-column">
            <div className="flex justify-end margin-right--little"><QuickAccessBar submission_tag={submission_tag}/></div>
             <div id="top" className="flex flex-column center-items">
                <div className="margin-top--little" style={{ maxWidth : "66vw"}}>
                    <h1><SubmissionTitle tag={submission_tag} /></h1>
                </div>

                <SubmissionDate submission_tag={submission_tag} />
                
                <div className="margin-top--little">
                    <StateIndicator submission_tag={submission_tag}/>
                </div>
                
                <AuthorList {...{
                    submission_tag,
                    emailSubject : `Related to submission ${submission_tag}`
                }} />

                <div className="margin-top--little" style={{ maxWidth : "max(60vw,500px)"}}>
                {/* <MultipleMetrices metrices={datasetMetrices} /> */}
               
                <ResearchAim submission_tag={submission_tag}/>
                </div>


                

            </div>
            <div className="flex flex-column center-items" style={{width : "100%"}}>
            <div className="flex">
                <SubmissionTag {...{ submission_tag, fontColor: fontColors[0] }} />
                <SubmissionViews {...{ submission_tag, fontColor: fontColors[1] }} />
                <SubmissionSampleCount  {...{ submission_tag, fontColor: fontColors[2] }} />
                <SubmissionProteinGroupCount {...{ submission_tag, fontColor: fontColors[3] }} />
                <SubmissionPeptideCount {...{ submission_tag, fontColor: fontColors[4] }} />
                <SubmissionCommentCount {...{ submission_tag, fontColor: fontColors[0] }} />
                
                </div>
            </div>
            <div>
                <SubmissionUpload {...{ submission_tag }}/>
            </div>
            <div className="flex flex--wrap align-start ">

                {_.isString(submission_tag) ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                </div> : null}
                <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <SubmissionConditionApplicationView {...{ submission_tag }}/>
                    {/* <ConditionApplicationsView /> */}
                {/* <StaticDatasetAttributesHierarchy submission_tag={submission_tag} /> */}
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

            <div className="margin-right ">
            <h3>Metatext</h3>
                <div className="flex flex--wrap" style={{ gap: "2rem" }}>                    
                    <Metatexts {...{submission_tag}} />
                
                       
            </div>
                </div>
        </div>
        )}

export default SubmissionOverview