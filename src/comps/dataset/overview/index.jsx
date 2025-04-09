import { useOutletContext } from "react-router";
import MultipleMetrices from "../../core/metrics/collection";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../../core/base/Header";
import _ from "lodash"
import { motion } from "framer-motion";
import { Button, Collapse, Divider, Icon } from "@blueprintjs/core";
import { copyTextToClipboard } from "../../../services/clipboard";
import { useGetPublicUserForSubmission, useGetSampleAttributes, useGetSubmissionMetatextByTag, useGetSubmissionSampleNames, useGetSubmissionSummaryString } from "../../../hooks/queries/submission.hooks";
import { AttributeFeatureTag, StaticDatasetAttributesHierarchy } from "../../submission/new/attribute/view/DatasetAttributesHierarchy";
import { getUserFullName } from "../../../services/format/user";
import { GenotypeCard } from "../../admin/genotypes/Genotypes";
import Loading from "../../core/base/loading";
import { titleFormat } from "../../../services/format/string";
import { QuickAccessBar } from "./Topbar";
import { ResearchAim } from "./Researchaim";
import { CraetedAt } from "../../core/metrics/CreatedAt";
import { StateIndicator } from "../../core/base/states/SubmssionState";
import { SampleAttributesView } from "../../core/base/attributes/SampleAttributesView";
import { AuthorList } from "../../core/authors/SubmissionAuthorList";
import { Metatexts } from "../../core/metatext/SubmissionMetatext";
import { SubmissionComments } from "../../submission/comments";





/**
 * @description React element to give an overview about a Dataset/Submission. 
 * @param {Object} props  
 * @returns 
 */
function DatasetOverview() {

    const { submission_tag, metadata, setTabHeader, tabHeader } = useOutletContext()    
    
    useEffect(() => {
        if (tabHeader !== "") setTabHeader("")
    }, [])
 
    const datasetMetrices = useMemo(() => {
        if (!_.isObject(metadata)) return []
        //get metrices available at any state of the project
        let basicMetrices = [
            { label: "Tag", metric: submission_tag },
            { label: "Proteome", metric: metadata.proteome_tags },
            { label: "Samples", metric: metadata.n_samples },
            { label: "Replicates", metric: metadata.n_replicates},
            //{ label: "Genotypes", metric : 2},
            //{ label: "Sample Attributes", metric: Object.keys(metadata.samples_attributes).length },
        ]
        //add others / optional 
        return basicMetrices 
    }, [submission_tag, _.isObject(metadata)])
    
    if (!_.isObject(metadata)) return null
    
    
    const hasGenotypes = _.isObject(metadata.samples_genotypes) && _.keys(metadata.samples_genotypes).length > 0
    // let dataAttributes = _.values(metadata.attributes)
    // let datasetAttributeValues = metadata.dataset_attributes
 
    return (
        <div style={{ overflowY: "scroll", height: "100%" }}>
            <div className="flex justify-end intent-margin-right--little"><QuickAccessBar submission_tag={submission_tag}/></div>
             <div id="top" className="flex flex-column center-items">
                <div className="intent-margin-top" style={{ maxWidth : "66vw"}}>
                <h1>{metadata.title}</h1>
                </div>
                <AuthorList {...{
                    submission_tag,
                    emailSubject : `Related to dataset ${metadata.title} (${metadata.label})`
                }} />
                <div className="font-size--small intent-margin-top--little">
                    <CraetedAt createdat={metadata.created_at}/>
                </div>
                <div className="intent-margin-top--little">
                    <StateIndicator submission_tag={submission_tag}/>
                </div>

                <div className="intent-margin-top--little">
                <MultipleMetrices metrices={datasetMetrices} />
               
                <ResearchAim submission_tag={submission_tag}/>
                </div>

            </div>

            
            
            <div className="flex flex--wrap">
                {hasGenotypes ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Genotypes ({_.keys(metadata.genotypes).length})</h3>
                    <div className="flex flex-column div--expand padding--little">
                        {_.keys(metadata.genotypes).map(genotypeLabel => <GenotypeCard {...{ justDisplay: true, genotype: metadata.genotypes[genotypeLabel], fill: true }} />)}
                    </div>
                </div> : null}
                {_.has(metadata,"tag") ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Sample Attributes</h3>
                    <SampleAttributesView submission_tag={submission_tag} minimal={false} />
                </div> : null}
            <div className="bg--lightgrey margin--medium padding--little" style={{maxWidth : "33vw", minWidth:"20vw", maxHeight: "min(50vh,500px)", overflowY:"scroll"}}>
                    <h3>Dataset Attributes</h3>
                <StaticDatasetAttributesHierarchy submission_tag={submission_tag} />
                {/* <DatasetAttributeHierarchy {...{
                    selectedDasetAttributeValues: datasetAttributeValues,
                    selectedAttributes: dataAttributes
                    }} /> */}
                </div>
                {_.has(metadata,"links") && metadata.links.length > 0 ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Links</h3>
                    {metadata.links.map(link => <div key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer"><strong>{titleFormat(link.comment)}</strong></a></div>)}
                </div> : null}
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