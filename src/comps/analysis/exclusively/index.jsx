import { useOutletContext } from "react-router";
import { api } from "@/api";
import { useMemo, useState } from "react";
import _ from "lodash";
import { Attribute } from "../../core/base/attributes/Attribute";
import { ConditionApplicationsView } from "../../core/base/condition_applications/ConditionApplicationView";
import { ProteinGroup } from "../../core/base/protein/Protein";
import { getColorPalette } from "@mitocube/viz/src/colors/palette";
import DownloadIcon from "@/comps/core/svg/icons/chartSelection/Download";
import { usePrefetchConditionApplicationTexts } from "@/api/orchestrated/conditionApplications";
import { usePrefetchProteins } from "@/api/orchestrated/proteins";
import { AnnotationSelectionMenu } from "@/comps/core/base/annotations/AnnotationSelectionMenu";
import { addStringToArrayOrRemove } from "@/services/arrays/transforms";

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

/**
 * @description This component displays the condition applications for a given submission and attribute. It fetches the condition application tags associated with the submission and attribute, and renders them in a grid layout. Each condition application is displayed using the `ConditionApplicationsView` component.
 * @param {Object} props 
 * @param {string} props.submission_tag - The submission tag for which to display the condition applications
 * @param {string} props.attribute_tag - The attribute tag for which to display the condition applications 
 * @returns 
 */
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
    const [annotationTags, setAnnotationTags] = useState([])
    const {data : ca_attributes, isLoading : isLoadingCaAttributes} = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : submission_tag}, {enabled : _.isString(submission_tag)}    )
    const { data: exclusivelyQuantified, isLoading, isSuccess } = api.submissions.ranking.useGetSubmissionExclusivelyQuantifiedProteinGroups({ tag: submission_tag, annotation_tags : _.join(annotationTags, ";")  }, { enabled: typeof submission_tag === "string" && submission_tag.length > 0 })
    const {data : sample_count} = api.submissions.samples.useGetSubmissionSampleCount({tag : submission_tag}, {enabled : _.isString(submission_tag)})
    
    const attributeCounts = useMemo(() => {
        if (!_.isArray(exclusivelyQuantified)) return {};
        return _.countBy(exclusivelyQuantified, 'attribute_tag');
    }, [exclusivelyQuantified]);
    
    const conditionApplicationTags = useMemo(() => { 
        if (!_.isArray(exclusivelyQuantified) || !_.isArray(ca_attributes)) return [];
        const tags = _.flatMap(exclusivelyQuantified, item => item.exclusively_ca_tags);
        return _.uniq(tags);
    }, [exclusivelyQuantified, ca_attributes]);
        
    const proteinTags = useMemo(() => { 
        if (!_.isArray(exclusivelyQuantified) || !_.isArray(ca_attributes)) return [];
        const tags = _.flatMap(exclusivelyQuantified, item => item.tag);
        return _.uniq(tags);
    }, [exclusivelyQuantified, ca_attributes]);

    const { isReady, tagQueries } = usePrefetchConditionApplicationTexts(_.isArray(conditionApplicationTags) ? conditionApplicationTags : []);
    const { isReady: isProteinsReady, tagQueries: proteinTagQueries, isLoading: isLoadingProteins } = usePrefetchProteins(proteinTags)

    const caTagMap = useMemo(() => {
        if (!isReady || !_.isArray(conditionApplicationTags)) return new Map();
        const map = new Map()
        tagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(conditionApplicationTags[idx], q.data)
            }
        })
        return map;
    }, [tagQueries, conditionApplicationTags]);


    const proteinTagGeneNameMapRef = useMemo(() => { 
        if (isLoadingProteins || !_.isArray(proteinTags)) return new Map();
        const map = new Map()
        proteinTagQueries.forEach((q, idx) => {
            if (q.data) {
                map.set(proteinTags[idx], { text: q.data.gene_name })
            }
        })
        return map;
    }, [isLoadingProteins, proteinTagQueries, proteinTags]);


    const handleAttributeDownload = (attribute_tag) => {
        const filteredData = exclusivelyQuantified.filter(item => item.attribute_tag === attribute_tag);
        const csvContent = "data:text/csv;charset=utf-8," +
            ["Protein Group","Gene name","Mean","Quantified in Samples","Condition Application Tags", "Condition Application Text"].join(",") + "\n" +
            filteredData.map(item => `${item.tag},${proteinTagGeneNameMapRef.get(item.tag)?.text || ""},${item.mean},${item.quantified_in_samples},"${item.exclusively_ca_tags.join(";")}","${item.exclusively_ca_tags.map(ca_tag => caTagMap.get(ca_tag) || "").join(";")}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `exclusively_quantified_${attribute_tag}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAnnotationTagSelection = (e, annotation_tag) => {
        setAnnotationTags(prevValues => addStringToArrayOrRemove({ array: prevValues, string: annotation_tag }))
    }

    return <div className="flex flex-column">
        <span>This shows the exclusively quantified proteins in the submission which may escape the regular  statistical analysis due to missing values.</span>
        <div className="flex center-items" style={{marginTop : "0.5rem", marginBottom : "0.5rem", gap : "0.5rem"}}>
            <span>Filter by annotation group | </span>
            <AnnotationSelectionMenu
                submission_tags={[submission_tag]}
                selected_tags={annotationTags}
                onRemove={handleAnnotationTagSelection}
                onSelection={handleAnnotationTagSelection} />
            </div>
        <div><span>There are <strong>{exclusivelyQuantified?.length || 0}</strong> exclusively quantified proteins.</span></div>
        <div className="flex center-items" style={{marginTop : "0.5rem", marginBottom : "0.5rem", gap : "0.5rem"}}>
        <span>Download exclusively quantified features</span><DownloadIcon placeholder="" items={ca_attributes} itemIsAttribute={true} callback={(v, attribute_tag) => handleAttributeDownload(attribute_tag)} />
        </div>
        {isLoading || isLoadingCaAttributes ? <div>Loading...</div> : null}

        {_.isArray(ca_attributes) && _.isArray(exclusivelyQuantified) ?
            <div>
            
                <div style={{
                    marginLeft: "1rem",
                    marginRight: "2rem",
                    marginTop: "1rem",
                    paddingRight: "0.5rem",
                    display: "grid",
                    gridTemplateColumns: `170px ${_.join(_.map(ca_attributes, (attribute_tag) => '1fr'), " ")}`
                }}>

                <div style={{ gridColumn: "1", border: "0.5px solid black"}}>Protein Group</div>
                    {ca_attributes.map((attribute_tag, idx) => <div key={attribute_tag}
                        style={{
                            gridColumn: idx + 2,
                            border: "0.5px solid black",
                            width: "100%"
                        }} className="flex flex-column center-items">

                    <span><Attribute attribute_tag={attribute_tag} /><span>(n={attributeCounts[attribute_tag] || 0})</span></span>
                    <AttributeConditionApplicationView submission_tag={submission_tag} attribute_tag={attribute_tag} />

                </div>)}
            </div>

            
                <div style={{
                    marginTop : "0.5rem",
                    marginLeft: "1rem",
                    marginRight: "2rem",
                    display: "grid",
                    alignContent: "start",
                    paddingRight: "0.5rem",
                    overflowY: "scroll",
                    height: "85vh", gridTemplateColumns: `170px ${_.join(_.map(ca_attributes, (attribute_tag) => '1fr'), " ")}`
                }}>

            {_.isArray(exclusivelyQuantified) && exclusivelyQuantified.map((protein_group, idx) => {
                return <div key={`${protein_group.tag}-${idx}`} style={{
                        gridRow: idx + 2,
                        gridColumn: "1",
                        border: "0.5px solid black",
                        paddingLeft: "0.5rem",
                        userSelect: "text",  
                    cursor: "text",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                    <ProteinGroup
                        tag={protein_group.tag}
                        minimal={true}
                        redirect_to_protein_site={false}
                        disableTooltip={false} />
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