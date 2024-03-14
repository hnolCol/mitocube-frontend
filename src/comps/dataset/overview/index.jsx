import { useOutletContext } from "react-router";
import MultipleMetrices from "../../core/metrics/collection";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../../core/base/Header";
import _ from "lodash"
import { motion } from "framer-motion";
import { Button, Collapse, Divider, Icon } from "@blueprintjs/core";
import { copyTextToClipboard } from "../../../services/clipboard";
import { getFormatDateFromTimestamp } from "../../../services/date/format";
import { useGetSubmissionMetatext } from "../../../hooks/queries/submission.hooks";
import { StateIndicator } from "../../submission/view/SubmissionContainer";
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks";
import {  groupListByProperty } from "../../../services/arrays/groupby";
import DatasetAttributeHierarchy, { AttributeFeatureTag } from "../../submission/new/attribute/view/DatasetAttributesHierarchy";
import { getUserFullName } from "../../../services/format/user";
import { GenotypeCard } from "../../admin/genotypes/Genotypes";
import Loading from "../../core/base/loading";
import { titleFormat } from "../../../services/format/string";

export function Metatexts({ metadata, fill = false }) {

    const { data: metatext, isSuccess, isLoading, isFetching, isError} = useGetSubmissionMetatext({ }, { staleTime: Infinity })
    if (isLoading || isFetching) return <Loading />
    if (isError) return <p>Error occurred...</p>
    if (!_.isObject(metatext)) return null 

    return <div className="flex flex--wrap" style={{gap:"2rem"}}>{_.isObject(metadata) && _.isObject(metadata.metatext)?
        _.keys(metatext.names).filter(metatextTag => _.isString(metadata.metatext[metatextTag])).map(metatextTag => <div
            className="container--shadow padding--little intent-margin-top--little"
            key = {metatextTag} >
        
            <MetatextBox {...{metadata,metatextTag,metatext,width: fill ? "100%" : undefined}} />
    
        </div>)
    
        : null
    }</div>
    

}

export function MetatextBox({ metatextTag, metadata, metatext, width = "25vw"}) {
    const [mouseIn, setMouseIn] = useState(false)

    return (
        <motion.div onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)} className="margin--little">
        <div className="flex margin--little justify-space-between">
                <div className="flex flex-column"><div><h3>{metatext.names[metatextTag]}</h3></div></div>
                <div><Button
                    style={{ opacity: mouseIn ? 1 : 0 }}
                    icon="clipboard"
                    small={true}
                    minimal={true}
                    onClick={() => copyTextToClipboard(metadata.metatext[metatextTag])}/></div>
        </div>
        <div
            className="intent-padding-right--little container--scroll-y-hide-x"
            style={{ textAlign: "justify", width, height: "33vh" }}>
            
                {metadata.metatext[metatextTag]}
    </div>
    </motion.div>)

}


export function AuthorList({user, collaborators = [], emailSubject = ""}) {
    
    const { data: users } = useGetPublicUserInfo()
    if (!_.isObject(users)) return null 
    const userByLabel = groupListByProperty(users, "label")
    const datasetUserLabels = _.concat(user, collaborators).filter(userLabel => _.has(userByLabel, userLabel))
    let affiliation = {}
    return (
        <div className="flex flex-column center-items">
            <div className="flex">
            {datasetUserLabels
                .map((userLabel, idx) => {
                    const user = userByLabel[userLabel][0]
                    affiliation[user.research_group] ??= _.keys(affiliation).length + 1
                    const affiliationIdx = affiliation[user.research_group]
                return (
                    <div className="flex intent-margin-right--little div--round" key={`${user.email}-${idx}`}>
                            <a
                                href={`mailto:${user.email}?subject=${emailSubject}`} //cc=${_.join(authors.filter(author => author.email !== authorProps.email).map(author => author.email), ", ")}
                                className="router-link">
                            <div className="flex" style={{color : "black"}}>
                                <strong>{getUserFullName(user)}</strong>
                                <div style={{position:"relative",top:"-0.3rem",fontSize:"70%"}}>{affiliationIdx}</div><div className="intent-margin-left--little"><Icon icon="envelope"/></div>
                            </div>
                        </a>
                        
                        {datasetUserLabels.length > 1?
                            idx === datasetUserLabels.length - 2 ? <div>, and</div> : idx !== datasetUserLabels.length - 1?<div>,</div> : null : null}
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



function DatasetOverview({authenticationStatus}) {

    const { dataset_label, metadata, setTabHeader, tabHeader } = useOutletContext()    
    
    
    useEffect(() => {
        if (tabHeader !== "") setTabHeader("")
        
    }, [])
 
    const datasetMetrices = useMemo(() => {
        if (!_.isObject(metadata)) return []
        //get metrices available at any state of the project
        let basicMetrices = [
            { label : "Label", metric : metadata.label},
            { label: "Samples", metric: metadata.sample_names.length },
            { label: "Replicates", metric: _.isObject(metadata.samples_genotypes)?_.keys(metadata.samples_genotypes).length : 0},
            { label: "Genotypes", metric : 2},
            { label: "Sample Attributes", metric: Object.keys(metadata.samples_attributes).length },
        ]
        //add others / optional 
        return basicMetrices 
    }, [dataset_label, _.isObject(metadata)])
    
    if (!_.isObject(metadata)) return null

    const [m, formatedTime] = getFormatDateFromTimestamp(metadata.created_on)
    
    const hasGenotypes = _.isObject(metadata.samples_genotypes)
    let dataAttributes = _.values(metadata.attributes)
    let datasetAttributeValues = metadata.dataset_attributes
 
    return (
        <div style={{overflowY:"scroll", height : "90vh "}}>
             <div id="top" className="flex flex-column center-items">
                <div className="intent-margin-top" style={{ maxWidth : "66vw"}}>
                <h1>{metadata.title}</h1>
                </div>
                <AuthorList {...{
                    authenticationStatus,
                    user: metadata.user_label,
                    collaborators: metadata.collaborators,
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
                        {metadata.metatext["metatext:research_aim"]}
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
                <DatasetAttributeHierarchy {...{
                    selectedDasetAttributeValues: datasetAttributeValues,
                    selectedAttributes: dataAttributes
                    }} />
                </div>
                {metadata.links.length > 0 ? <div className="bg--lightgrey margin--medium padding--little" style={{ maxWidth: "33vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "scroll" }}>
                    <h3>Links</h3>
                    {metadata.links.map(link => <div key={link.id}><a href={link.url} target="_blank" rel="noopener noreferrer"><strong>{titleFormat(link.comment)}</strong></a></div>)}
                </div> : null}
            </div>
            <div className="intent-margin-right ">
            <h3>Metatext</h3>
            <div className="flex flex--wrap" style={{gap:"2rem"}}>
            {_.isObject(metadata) && _.isObject(metadata.metatext)?
                    <Metatexts metadata={metadata}/>
                
                        : null}
            </div>
                </div>
        </div>
        )}

export default DatasetOverview