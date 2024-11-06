import { useOutletContext } from "react-router";
import MultipleMetrices from "../../core/metrics/collection";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../../core/base/Header";
import _ from "lodash"
import { motion } from "framer-motion";
import { Button, Collapse, Divider, Icon } from "@blueprintjs/core";
import { copyTextToClipboard } from "../../../services/clipboard";
import { getFormatDateFromTimestamp } from "../../../services/date/format";
import { useGetPublicUserForSubmission, useGetSubmissionMetatextByTag, useGetSubmissionSampleNames, useGetSubmissionSummaryString } from "../../../hooks/queries/submission.hooks";
import { StateIndicator } from "../../submission/view/SubmissionContainer";
import DatasetAttributeHierarchy, { AttributeFeatureTag, StaticDatasetAttributesHierarchy } from "../../submission/new/attribute/view/DatasetAttributesHierarchy";
import { getUserFullName } from "../../../services/format/user";
import { GenotypeCard } from "../../admin/genotypes/Genotypes";
import Loading from "../../core/base/loading";
import { titleFormat } from "../../../services/format/string";
import TooltipButton from "../../core/base/buttons/TooltipButton";

export function Metatexts({ dataset_tag, fill = false }) {

    const { data: metatexts, isSuccess, isLoading, isFetching, isError} = useGetSubmissionMetatextByTag({tag : dataset_tag}, { staleTime: Infinity })
    console.log(metatexts)
    if (isLoading || isFetching) return <Loading />
    if (isError) return <p>Invalid response when getting metadata...</p>
    if (!_.isArray(metatexts)) return null 

    return (
        <div className="flex flex--wrap" style={{ gap: "2rem" }}>
                    
                    
            {metatexts.map(metatext => <div
                className="container--shadow padding--little intent-margin-top--little"
                key = {metatext.tag}>
            
                    <MetatextBox {...{...metatext, width: fill ? "100%" : undefined}} />
        
            </div>)}

        </div>)}

export function MetatextBox({ tag, title, content, width = "25vw"}) {
    const [mouseIn, setMouseIn] = useState(false)
    return (
        <motion.div onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)} className="margin--little">
        <div className="flex margin--little justify-space-between">
                <div className="flex flex-column"><div><h3>{title}</h3></div></div>
                <div><Button
                    style={{ opacity: mouseIn ? 1 : 0 }}
                    icon="clipboard"
                    small={true}
                    minimal={true}
                    onClick={() => copyTextToClipboard(content)}/></div>
        </div>
        <div
            className="intent-padding-right--little container--scroll-y-hide-x"
            style={{ textAlign: "justify", width, height: "33vh" }}>
                {content}
    </div>
    </motion.div>)

}


export function AuthorList({dataset_tag, emailSubject = ""}) {
    const datasetUserLabels  = []
    const {data : users, isLoading, isFetching} = useGetPublicUserForSubmission({dataset_tag})
    if (isLoading || isFetching || !_.isArray(users) || users.length === 0) return null 
    let affiliation = {}
    const n_users = users.length
    return (
        <div className="flex flex-column center-items">
            <div className="flex">
            {users
                .map((user, idx) => {
                    affiliation[user.research_group] ??= _.keys(affiliation).length + 1
                    const affiliationIdx = affiliation[user.research_group]
                return (
                    <div className="flex intent-margin-right--little div--round" key={`${user.tag}-${idx}`}>
                            <a
                                href={`mailto:${user.email}?subject=${emailSubject}`} //cc=${_.join(authors.filter(author => author.email !== authorProps.email).map(author => author.email), ", ")}
                                className="router-link">
                            <div className="flex" style={{color : "black"}}>
                                <strong>{getUserFullName(user)}</strong>
                                <div style={{position:"relative",top:"-0.3rem",fontSize:"70%"}}>{affiliationIdx}</div><div className="intent-margin-left--little"><Icon icon="envelope"/></div>
                            </div>
                        </a>
                        
                        {n_users > 1?
                            idx === n_users - 2 ? <div>, and</div> : idx !== n_users - 1?<div>,</div> : null : null}
                        </div>
                )
                })}</div>
            <div>{_.keys(affiliation).map(researchGroup => <div className="font-size--smallest">{`${affiliation[researchGroup]} ${researchGroup}`}</div>)}</div>
        </div>
    )
}



  

function ExperimentalInfo({ title = "", details = "" }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <motion.div className="flex flex-column margin-top-bottom--medium div--round " transition={{ duration: 0.8, delay: 0.0 }}
        animate={ isOpen ? { maxHeight: "25vw" } : { maxHeight: "5vw" }} style={{ maxHeight: "5vw"}}>
            <div className="flex">
                <Button icon={isOpen ? "chevron-down" : "chevron-right"} small={true} minimal={true} onClick={() => setIsOpen(!isOpen)}/>
                <Header text={title} letterSpacing="0.05rem" />
                {isOpen ? <Button icon={"clipboard"} small={true} minimal={true} onClick={() => copyTextToClipboard(details)}/> : null}
            </div>
            <motion.div className={`flex ${isOpen ? "container--scroll-y-hide-x" : "no-scroll"}`} animate={isOpen ? { opacity: 1 } : { opacity: 0.2 }} transition={{ duration: 1.4, delay: 0.2 }} opacity={0.2}>
                <div className="padding--medium intent-margin-left--little">
                    {details}
                </div>
            </motion.div>
        </motion.div>
    )
}


function SampleAttributeSamples({sampleAttr, sampleAttributeValueTag, metadata, attribute}) {

    return (
        <div className="padding--tiny"><AttributeFeatureTag {...{attribute,value : metadata.attribute_values_by_tag[sampleAttributeValueTag], valueIsFeature : attribute.has_features_value, popoverPosition : "right"}} /></div>
    )
}

/**
 * 
 * @param {Object} props 
 * @param {import("../../../types/submissions").Submission} props.metadata 
 */
function SamplesAttributes({ metadata }) {
    const [open, setOpen] = useState({})
    const sampleAttributes = metadata.samples_attributes 
    const samplesNames = metadata.sample_names
    const sampleAttributesTags = _.keys(sampleAttributes)
    
    return (<div className="padding--medium">
        <p>{_.keys(sampleAttributes).length} samples attributes defined.</p>
        {sampleAttributesTags.map(sampleAttributeTag => {
            const isOpen = _.has(open, sampleAttributeTag) && open[sampleAttributeTag]
            const attribute = metadata.attributes[sampleAttributeTag]
            return (
                <div>
                    <Button
                        minimal={true}
                        fill={true}
                        alignText="left"
                        small={true}
                        text={attribute.text}
                        icon={isOpen ? "chevron-down" : "chevron-right"}
                        onClick={() => setOpen(prevValues => { return { ...prevValues, [sampleAttributeTag]: _.has(prevValues, sampleAttributeTag) ? !prevValues[sampleAttributeTag] : true } })} />
                    <Collapse isOpen={isOpen}>
                        {_.keys(sampleAttributes[sampleAttributeTag]).map(sampleAttributeValueTag => {
                            return <SampleAttributeSamples
                                sampleAttr={sampleAttributes[sampleAttributeTag][sampleAttributeValueTag]}
                                {...{
                                    sampleAttributeValueTag,
                                    metadata,
                                    attribute: metadata.attributes[sampleAttributeTag]
                                }} />
                        })}
                    </Collapse>
                    <Divider />
                </div>
            )
        })}
        
    </div>)
}


/**
 * @param {Object} props
 * @param {String} props.submission_tag - The submission tag for which the quick access control should be established.
 * @returns 
 */
function QuickAccessBar({ submission_tag }) {
    const [msg, setMsg] = useState()
    const { isLoading : summaryIsLoading, isFetching : summaryIsFetching, isError : isSubmissionSummaryError, refetch: fetchSummaryString } = useGetSubmissionSummaryString(
        { tag: submission_tag },
        {
            enabled: false, //only use refetch function to get the data. 
            onSuccess: data => {
                copyTextToClipboard(data)
                setMsg("Summary string copied to clipboard.")
            }
        })
    
    const {isLoading : sampleNamesIsLoading,isFetching : sampleNamesIsFetching, refetch : fetchSampleNames, isError : isSampleNamesError} = useGetSubmissionSampleNames({tag : submission_tag},{enabled : false, onSuccess: data => {
        copyTextToClipboard(data)
        setMsg("Samples names copied to clipboard.")
    }
    })
    
    useEffect(() => {
        if (isSubmissionSummaryError) setMsg("Retrieving the submission summary resulted in an error.")
        else if (isSampleNamesError) setMsg("Retrieving the sample names resulted in an error.")
    },[isSubmissionSummaryError, isSampleNamesError])
    
    return (
        <div className="flex">
            <TooltipButton icon="tag" content="Copy submission tag" onClick={()=>copyTextToClipboard(submission_tag)} />
            <TooltipButton icon="info-sign" content="Tab delimited submission summary to paste in excel. " onClick={() => fetchSummaryString()} loading={summaryIsFetching | summaryIsLoading} />
            <TooltipButton icon="numbered-list" onClick={() => fetchSampleNames()} loading={sampleNamesIsFetching | sampleNamesIsLoading} content = "Tab delimited sample name information."/>
            <div className="font-size--smallest">{msg}</div>
        </div>
    )
}


function DatasetOverview({authenticationStatus}) {

    const { dataset_tag, metadata, setTabHeader, tabHeader } = useOutletContext()    
    
    
    useEffect(() => {
        if (tabHeader !== "") setTabHeader("")
        
    }, [])
 
    const datasetMetrices = useMemo(() => {
        if (!_.isObject(metadata)) return []
        //get metrices available at any state of the project
        let basicMetrices = [
            { label: "Label", metric: dataset_tag },
            { label: "Proteome", metric: metadata.proteome_tags },
            { label: "Samples", metric: metadata.n_samples },
            { label: "Replicates", metric: metadata.n_replicates},
            //{ label: "Genotypes", metric : 2},
            //{ label: "Sample Attributes", metric: Object.keys(metadata.samples_attributes).length },
        ]
        //add others / optional 
        return basicMetrices 
    }, [dataset_tag, _.isObject(metadata)])
    
    if (!_.isObject(metadata)) return null

    console.log(metadata)
    const [m, formatedTime] = getFormatDateFromTimestamp(metadata.created_at)
    
    const hasGenotypes = _.isObject(metadata.samples_genotypes) && _.keys(metadata.samples_genotypes).length > 0
    let dataAttributes = _.values(metadata.attributes)
    let datasetAttributeValues = metadata.dataset_attributes
 
    return (
        <div style={{ overflowY: "scroll", height: "100%" }}>
            <div className="flex justify-end intent-margin-right--little"><QuickAccessBar submission_tag={dataset_tag}/></div>
             <div id="top" className="flex flex-column center-items">
                <div className="intent-margin-top" style={{ maxWidth : "66vw"}}>
                <h1>{metadata.title}</h1>
                </div>
                <AuthorList {...{
                    dataset_tag,
                    emailSubject : `Related to dataset ${metadata.title} (${metadata.label})`
                }} />
                <div className="font-size--small intent-margin-top--little">
                    {`${m.fromNow()} (${formatedTime})`}
                </div>
                <div className="intent-margin-top--little">
                    <StateIndicator state={metadata.state} {...{authenticationStatus}} />
                </div>

                <div className="intent-margin-top--little">
                <MultipleMetrices metrices={datasetMetrices} />
                </div>
                <div style={{ maxWidth: "min(45vw,800px)", textAlign: "justify" }} className="intent-margin-top--little">
                    <div className="intent-margin-left--little"><h3>Abstract</h3></div>
                    <Divider />
                    <div className="margin--little padding--little">
                        <p>Research aim.</p>
                        {/* {metadata.metatext["metatext:research_aim"]} */}
                    </div>
                    <Divider/>
                </div>

            </div>

            
            
            <div className="flex flex--wrap">
                {hasGenotypes ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Genotypes ({_.keys(metadata.genotypes).length})</h3>
                    <div className="flex flex-column div--expand padding--little">
                        {_.keys(metadata.genotypes).map(genotypeLabel => <GenotypeCard {...{ justDisplay: true, genotype: metadata.genotypes[genotypeLabel], fill: true }} />)}
                    </div>
                </div> : null}
                {!_.isEmpty(metadata.samples_attributes) ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Sample Attributes</h3>
                    <SamplesAttributes {...{ metadata }} />
                </div> : null}
            <div className="bg--lightgrey margin--medium padding--little" style={{maxWidth : "33vw", minWidth:"20vw", maxHeight: "min(50vh,500px)", overflowY:"scroll"}}>
                    <h3>Dataset Attributes</h3>
                <StaticDatasetAttributesHierarchy submission_tag={dataset_tag} />
                <DatasetAttributeHierarchy {...{
                    selectedDasetAttributeValues: datasetAttributeValues,
                    selectedAttributes: dataAttributes
                    }} />
                </div>
                {_.has(metadata,"links") && metadata.links.length > 0 ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Links</h3>
                    {metadata.links.map(link => <div key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer"><strong>{titleFormat(link.comment)}</strong></a></div>)}
                </div> : null}
            </div>
            <div className="intent-margin-right ">
            <h3>Metatext</h3>
            <div className="flex flex--wrap" style={{gap:"2rem"}}>
                    <Metatexts {...{dataset_tag}} />
                
                       
            </div>
                </div>
        </div>
        )}

export default DatasetOverview