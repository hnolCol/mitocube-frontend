import _ from "lodash"
import { motion } from "framer-motion"
import { useState } from "react"
import { titleFormat } from "../../../services/format/string"
import { isHexColorLight } from "../../../services/colors"
import { Divider, Icon } from "@blueprintjs/core"
import { useGetSubmissionsCount } from "../../../hooks/queries/submission.hooks"
import Loading from "../../core/base/loading"
import { groupListByProperty } from "../../../services/arrays/groupby"
import { useGetAttributeValues } from "../../../hooks/queries/attribute.hooks"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"




export function AttributeValues({ attribute, labels, submissionFilter, setSubmissionFilter }) {
    const labelsFound = _.isArray(labels) && labels.length > 0
    const attributeIsFeature = attribute.has_features_value
    const { data : allSubmissionAttributeValues, isLoading : allSubIsLoading, isFetching : allSubIsFetching} = useGetAttributeValues({ attribute_tag : attribute.tag}, { staleTime : 600000})    
    const { data, isLoading, isFetching, isError } = useGetAttributeValues({ labels: _.join(labels, ";"), attribute_tag : attribute.tag}, { enabled: labelsFound})    
    const handleClick = (attribute_value) => {

        setSubmissionFilter(prevValues => {
            return {
                ...prevValues, "attribute_value_tag": addItemToArrayOrRemoveItIfPresent({
                    array: prevValues.attribute_value_tag,
                    item: attribute_value
                })
            }
        })
    }

    return (<div style={{ marginLeft: "1.6rem" }}>
        {isError ? <p>Error</p> : allSubIsLoading || allSubIsFetching ? <Loading /> :
            _.isObject(allSubmissionAttributeValues) && _.has(allSubmissionAttributeValues, "attribute_value_tags") && _.has(allSubmissionAttributeValues, "submission_count") ?
                allSubmissionAttributeValues.attribute_value_tags.map(attribute_value_tag => {
                    const attribute_value = allSubmissionAttributeValues.attribute_values_by_tag[attribute_value_tag]
                    const isSelected = _.has(submissionFilter,"attribute_value_tag") && submissionFilter["attribute_value_tag"].filter(attr => attr.tag === attribute_value.tag).length > 0
                    if (!_.isObject(attribute_value)) return null 
                    const count = labelsFound ? _.isObject(data) && _.has(data,["submission_count",attribute_value_tag]) ? data.submission_count[attribute_value_tag].submission_count : 0 : allSubmissionAttributeValues.submission_count[attribute_value_tag].submission_count
                    return <motion.div key={`${attribute_value_tag}-${count}`}  className="flex bg--grey center-items"
                        whileHover={{ color: "#000", backgroundColor: "#fafafa" }}>
                        <motion.button
                                disabled={count === 0}
                                onClick={() => handleClick(attribute_value)}
                                className={`attribute__filter__button ${isSelected ?"attribute__filter_button--selected":""}`}
                                transition={{ duration: 0.1 }}>
                            {attributeIsFeature ? `${attribute_value.genes} (${count})` : `${attribute_value.text} (${count})`}
                            </motion.button>
                        </motion.div>
            }) : null }
        </div>)
}


export function AttributeButton({ attribute, submissionFilter, setSubmissionFilter, setOpenGroup, group_tag, showAttributeValues, count }) {

    const isSelected = _.has(submissionFilter,"attribute_tag") && submissionFilter["attribute_tag"].filter(attr => attr.tag === attribute.tag).length > 0

    const handleClick = (e) => {
        e.stopPropagation()
        setSubmissionFilter(prevValues => {
            return {
                ...prevValues, "attribute_tag": addItemToArrayOrRemoveItIfPresent({
                    array: prevValues.attribute_tag,
                    item: attribute
                })
            }
        })
    }
    const handleOpen = (e) => {
        setOpenGroup(prevValues => {
            let { attributeIsOpen, isOpen } = prevValues[group_tag]
            const attributeWasOpen = _.has(attributeIsOpen, attribute.tag) ? attributeIsOpen[attribute.tag] : false
            attributeIsOpen[attribute.tag] = !attributeWasOpen
            let updatedProps = { attributeIsOpen, isOpen }
            return { ...prevValues, [group_tag]: updatedProps }
        })
    }
    return <ExpandableButton isOpen={showAttributeValues} text={attribute.text} handleClick={handleClick} handleOpen={handleOpen} count={count} highlight={isSelected} inactive={count===0} />
}


export function ExpandableButton({isOpen = false, text = "" , count = 0,showCount  = true, handleOpen, handleClick, highlight = false, inactive = false}) {
    console.log(inactive)
    return <motion.div className="flex bg--grey center-items"
        style={{width:"100%",color : inactive? "#474746": "#466688"}}
        whileHover={{ color: "#000", backgroundColor: "#fafafa" }}>
        <motion.button className="attribute__expand__button"
            disabled={inactive}
            onClick={handleOpen}><div>
                {isOpen ? "-" : "+"}
            </div>
        </motion.button>
        <motion.button
            onClick={handleClick}
            disabled={inactive}
            className={`attribute__filter__button ${highlight ?"attribute__filter_button--selected":""}`}
            style={{color : "#000"}}
            transition={{ duration: 0.1 }}>
            {showCount ? `${text} (${ count })` : `${ text }`}
    </motion.button></motion.div>
}



export function AttributeSelection({ states, setSubmissionFilter, submissionFilter, submissionsByState, attributesByTag, labels }) {
    const [openGroups, setOpenGroup] = useState({})

    const { data : allSubmissionAttributes, isLoading : asIsLoading, isFetching : asIsFetching, isSuccess : asIsSuccess } = useGetSubmissionsCount({ group: "attribute_tag"}, {staleTime : Infinity})
    const { data, isSuccess } = useGetSubmissionsCount({ group: "attribute_tag", labels : _.join(labels,";") }, {enabled : labels.length > 0})

    const attributeTags = asIsSuccess ? _.keys(allSubmissionAttributes) : []
    const attributes = _.isArray(attributeTags) ? _.sortBy(attributeTags.map(attributeTag => attributesByTag[attributeTag]).filter(attribute => attribute.allow_as_filter && attribute.allow_for_dataset),"min_state") : []
    const order = _.uniqBy(attributes,"group_tag").map(attribute => attribute.group_tag)
    const groupedAttributes = groupListByProperty(attributes, "group_tag")
   
    const handleOpenGroupTag = (group_tag) => {
        setOpenGroup(prevValues => {
            return {
                ...prevValues, [group_tag]: _.has(prevValues, group_tag) ?
                    { ...prevValues[group_tag], isOpen: !prevValues[group_tag].isOpen } :
                    { attributeIsOpen: {}, isOpen: true }
            }
        })
    }
    return (
        <div className="intent-margin-top--little" style={{width : "100%"}}>
            <h4>Attributes</h4>
            <div> 
                {asIsLoading || asIsFetching ? <Loading /> : asIsSuccess ?  <div>
                    {order.map(group_tag => {
                        let isOpen = _.has(openGroups, group_tag) && openGroups[group_tag].isOpen
                        return <div key={group_tag} className="flex flex-column" style={{flexGrow:1, width : "100%"}}> 
                            <ExpandableButton
                                isOpen={isOpen}
                                text={group_tag}
                                showCount={false}
                                count={groupedAttributes[group_tag].length}
                                handleClick={() => handleOpenGroupTag(group_tag)}
                                handleOpen={() => handleOpenGroupTag(group_tag)}/>
                            {isOpen ? groupedAttributes[group_tag].map(attribute => {
                                const showAttributeValues = _.has(openGroups, [group_tag, "attributeIsOpen", attribute.tag]) ?
                                    openGroups[group_tag]["attributeIsOpen"][attribute.tag] : false 
                                return (
                                    <div key={`${attribute.tag}`} style={{marginLeft : "0.8rem", width : "100%"}}>
                                        <AttributeButton {...{ attribute, setOpenGroup, group_tag, count : _.has(data,attribute.tag)?data[attribute.tag].submission_count:0, showAttributeValues, setSubmissionFilter, submissionFilter }} />
                                        {showAttributeValues ? 
                                            <AttributeValues {...{attribute, labels, submissionFilter, setSubmissionFilter}} />: null}
                                    </div>)
                            }) : null}
                            <Divider style={{margin:"1px"}}/>
                        </div>
                    })}
                    
                </div> : null}
            </div>
        </div>
    )
}
