import { useOutletContext, useParams } from "react-router";
import MultipleMetrices from "../../core/metrics/collection";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "../../core/base/Header";
import _ from "lodash"
import GroupingTable from "../../core/base/attribute_selection/AttributeTable";
import { motion } from "framer-motion";
import { Button, Collapse, Divider, Icon } from "@blueprintjs/core";
import APIError from "../../core/error/APIerror";
import { copyTextToClipboard } from "../../../services/clipboard";
import HelpOverlay from "../../core/overlay/Helpoverlay";
import {useOnScreen} from "../../../hooks/useOnScreen";
import { getFormatDateFromTimestamp } from "../../../services/date/format";
import { useGetSubmissionMetatext } from "../../../hooks/queries/submission.hooks";
import { StateIndicator } from "../../submission/view/SubmissionContainer";
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks";
import { arrayOfObjectsToObjectByProperty, groupListByProperty } from "../../../services/arrays/groupby";
import DatasetAttributeHierarchy, { AttributeFeatureTag } from "../../submission/new/attribute/view/DatasetAttributesHierarchy";
import { getAttributeForUserNumericInput } from "../../../services/attributes";
import { getUserFullName } from "../../../services/format/user";

function Metatext({ metatextTag, metadata, metatext }) {
    
    const [mouseIn, setMouseIn] = useState(false)
    return (
        <motion.div onMouseEnter={() => setMouseIn(true)} onMouseLeave={() => setMouseIn(false)}>
        <div className="flex margin--little justify-space-between">
                <div className="flex flex-column"><div><h3>{metatext.names[metatextTag]}</h3></div></div>
                <div><Button
                    style={{ opacity: mouseIn ? 1 : 0 }}
                    icon="clipboard"
                    small={true}
                    minimal={true}
                    onClick={() => copyTextToClipboard(metadata.metatext[metatextTag])}/></div>
        </div>
        <motion.div
            className="margin--little intent-margin-left intent-padding-right--little container--scroll-y-hide-x"
            style={{ textAlign: "justify", width: "25vw", height: "33vh" }}>
            
                {metadata.metatext[metatextTag]}
    </motion.div>
    </motion.div>)

}


export function AuthorList({user, collaborators = [], emailSubject = ""}) {
    
    const { data: users } = useGetPublicUserInfo()
    if (!_.isObject(users)) return null 
    const userByLabel = groupListByProperty(users, "label")
    const datasetUserLabels = _.concat(user, collaborators).filter(userLabel => _.has(userByLabel,userLabel))
    return (
        <div className="flex">
            {datasetUserLabels
                .map((userLabel, idx) => {
                const user = userByLabel[userLabel][0]
                return (
                    <div className="flex intent-margin-right--little div--round" key={`${user.email}-${idx}`}>
                            <a
                                href={`mailto:${user.email}?subject=${emailSubject}`} //cc=${_.join(authors.filter(author => author.email !== authorProps.email).map(author => author.email), ", ")}
                                className="router-link">
                            <div className="flex" style={{color : "black"}}>
                                <strong>{getUserFullName(user)}</strong>
                                <div className="intent-margin-left--little"><Icon icon="envelope"/></div>
                            </div>
                        </a>
                        {datasetUserLabels.length > 1?
                            idx === datasetUserLabels.length - 2 ? <div>, and</div> : idx !== datasetUserLabels.length - 1?<div>,</div> : null : null}
                        </div>
                )
            })}
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

    const { dataset_label, metadata, setTabHeader, tabHeader, attributesByTag } = useOutletContext()    
    const { data: metatext } = useGetSubmissionMetatext({ tokenString: authenticationStatus.token }, { staleTime: Infinity })
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
            <div className="bg--lightgrey margin--medium padding--little" style={{maxWidth : "33vw", minWidth:"20vw", maxHeight: "50vh", overflowY:"scroll"}}>
                    <h2>Genotypes</h2>
                    <p>To be added...</p>
            </div>
            <div className="bg--lightgrey margin--medium padding--little" style={{maxWidth : "33vw", minWidth:"20vw", maxHeight: "50vh", overflowY:"scroll"}}>
                    <h2>Sample Attributes</h2>
                    <SamplesAttributes {...{metadata}} />
            </div>
            <div className="bg--lightgrey margin--medium padding--little" style={{maxWidth : "33vw", minWidth:"20vw", maxHeight: "50vh", overflowY:"scroll"}}>
                    <h2>Dataset Attributes</h2>
                <DatasetAttributeHierarchy {...{
                    selectedDasetAttributeValues: datasetAttributeValues,
                    selectedAttributes: dataAttributes
                    }} />
                </div>
            </div>
            <div className="intent-margin-right ">
                <h2>Metatext</h2>
            <div className="flex flex--wrap" style={{gap:"2rem"}}>
            {_.isObject(metadata) && _.isObject(metadata.metatext) && _.isObject(metatext) ?
                    _.keys(metatext.names).filter(metatextTag => _.isString(metadata.metatext[metatextTag])).map(metatextTag => <div
                        className="container--shadow padding--little intent-margin-top--little "
                        key = {metatextTag} >
                    
                        <Metatext {...{metadata,metatextTag,metatext}} />
                
                    </div>)
                
                        : null}
            </div>
                </div>
        </div>
        )}

export default DatasetOverview