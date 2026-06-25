import { useOutletContext } from "react-router";
import { api } from "@/api";
import { AttributeSelection } from "../../core/base/attributes/AttributeSelection";

import _ from "lodash";
import { Attribute } from "../../core/base/attributes/Attribute";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { ProteinGroup } from "../../core/base/protein/Protein";
import { getColorPalette } from "@mitocube/viz/src/colors/palette";


export function AttributeConditionApplicationHighlight({ submission_tag, attribute_tag, text = " ", highlight_ca_tags = [] }) {
    
    const { data: conditionApplicationTags, isLoading: isLoadingConditionApplications } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : submission_tag, attribute_tags : attribute_tag, return_unique : true}, {enabled : _.isString(submission_tag) && _.isString(attribute_tag) ,  staleTime : Infinity}    )
    const ca_attribute_unique_count = _.isObject(conditionApplicationTags) && _.has(conditionApplicationTags, attribute_tag) ? conditionApplicationTags[attribute_tag].length : 0
    const colors = getColorPalette(ca_attribute_unique_count)
    return <div className="flex justify-space-around" style={{ width: "100%" }}>
        {ca_attribute_unique_count > 0 ?
            conditionApplicationTags[attribute_tag].map((ca_tags,idx_ca) => {
                const intersection = _.intersection(ca_tags, highlight_ca_tags);
           
                return ca_tags.map(ca_tag => {
                    const highlight = intersection.includes(ca_tag)
                    return <div
                        className="justify-space-around margin--tiny"
                        style={{
                            backgroundColor: highlight ? colors[idx_ca] : "transparent",
                            width: "100%",
                            display: "flex",
                            color: text !== " " && highlight ? "black" : "transparent",
                            border: "0.5px solid black"
                        }} key={ca_tag}>
                    <div className = "padding--little">{text}</div></div>
                })
            }) : null}
     </div>

}

export function AttributeConditionApplicationView({ submission_tag, attribute_tag, }) {
    
    const { data: conditionApplicationTags, isLoading: isLoadingConditionApplications } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : submission_tag, attribute_tags : attribute_tag, return_unique : true}, {enabled : _.isString(submission_tag) && _.isString(attribute_tag) ,  staleTime : Infinity}    )
    const ca_attribute_unique_count = _.isObject(conditionApplicationTags) && _.has(conditionApplicationTags, attribute_tag) ? conditionApplicationTags[attribute_tag].length : 0
    return <div className="flex justify-space-around" style={{width : "100%"}}>
        {ca_attribute_unique_count > 0 ?
            conditionApplicationTags[attribute_tag].map((ca_tags,idx) => {
                return <div
                    key={`ca_tags-${idx}-${_.join(ca_tags, "-")}`}
                    style={{
                    width: `${100 / ca_attribute_unique_count}%`,
                    borderTop: "0.5px solid black",
                    borderRight: idx < ca_attribute_unique_count - 1 ? "0.5px solid black" : "none"
                }}>
                    {ca_tags.map(ca_tag => {
                        return <div
                        style={{ width: `${100 / ca_tags.length}%` }}
                        className="justify-space-around"
                        key={ca_tag}>
                            <ConditionApplicationsView tag={ca_tag} />
                    </div>})}
                </div>
            }) : null}
     </div>
}



export function SubmissionExclusivelyQuantified() {


    const { submission_tag } = useOutletContext();
    const {data : ca_attributes, isLoading : isLoadingCaAttributes} = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : submission_tag}, {enabled : _.isString(submission_tag)}    )
    const { data: exclusivelyQuantified, isLoading, isSuccess } = api.submissions.ranking.useGetSubmissionExclusivelyQuantifiedProteinGroups({ tag: submission_tag }, { enabled: typeof submission_tag === "string" && submission_tag.length > 0 })
    const {data : sample_count} = api.submissions.samples.useGetSubmissionSampleCount({tag : submission_tag}, {enabled : _.isString(submission_tag)})

    return <div className="flex flex-column">
        <span>This shows the exclusively quantified proteins in the submission which may escape the regular  statistical analysis.</span>
        <div><span>There are <strong>{exclusivelyQuantified?.length || 0}</strong> exclusively quantified proteins.</span></div>
        <span>Note that exclusively quantified proteins are defined per attribute. Select an attribute to view the exclusively quantified proteins for that attribute.</span>
        <AttributeSelection attribute_tags={ca_attributes} selected={[]} onSelect={(attribute_tag) => setAttribute(attribute_tag)} />
        
        {isLoading || isLoadingCaAttributes ? <div>Loading...</div> : null}

        {_.isArray(ca_attributes) && _.isArray(exclusivelyQuantified) ? <div>
            
            <div style={{ display: "grid", gridTemplateColumns: `170px ${_.join(_.map(ca_attributes, (attribute_tag) => '1fr'), " ")}` }}>

                <div style={{ gridColumn: "1", border: "0.5px solid black"}}>Protein Group</div>
                {ca_attributes.map((attribute_tag, idx) => <div key={attribute_tag} style={{ gridColumn: idx + 2, border: "0.5px solid black", width : "100%" }} className="flex flex-column center-items">
                    <Attribute attribute_tag={attribute_tag} />
                    <AttributeConditionApplicationView submission_tag={submission_tag} attribute_tag={attribute_tag} />

                </div>)}
            </div>

            
            <div style={{ display: "grid", alignContent: "start", overflowY : "scroll", height : "75vh", gridTemplateColumns: `170px ${_.join(_.map(ca_attributes, (attribute_tag) => '1fr'), " ")}` }}>
            {_.isArray(exclusivelyQuantified) && exclusivelyQuantified.map((protein_group, idx) => {
                return <div key={`${protein_group.tag}-${idx}`} style={{
                        gridRow: idx + 2,
                        gridColumn: "1",
                        border: "0.5px solid black",
                        paddingLeft: "0.5rem",
                        
                    }}>
                    <ProteinGroup tag={protein_group.tag} minimal={true} redirect_to_protein_site={false} />
                </div>
                
            })}


            {_.isArray(exclusivelyQuantified) ? exclusivelyQuantified.map((protein_group, idx) => {
                return ca_attributes.map((attribute_tag, attribute_idx) => {
                    return <div key={`${protein_group.tag}-${attribute_tag}`}
                        style={{
                            gridColumn: attribute_idx + 2,
                            gridRow: idx + 2
                        }}>
                        
                        <AttributeConditionApplicationHighlight
                            submission_tag={submission_tag}
                            attribute_tag={attribute_tag}
                            text={`${_.round(protein_group.mean, 2)} (${protein_group.quantified_in_samples}/${sample_count})`}
                            highlight_ca_tags={protein_group.exclusively_ca_tags} /></div>
                })
            }) : null}
          
            </div>

      

            

            



        </div> : null}
        
        </div>
} 