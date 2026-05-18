import _ from "lodash"
import { motion } from "framer-motion"
import Loading from "../../core/base/loading"
import { useGetAttributeValues } from "@/hooks/queries2/attribute.hooks"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"




export function AttributeValues({ attribute, tags, submissionFilter, setSubmissionFilter }) {
    const labelsFound = _.isArray(tags) && tags.length > 0
    const attributeIsFeature = attribute.has_features_value
    
    const { data: allSubmissionAttributeValues, isLoading: allSubIsLoading, isFetching: allSubIsFetching } = useGetAttributeValues({ attribute_tag: attribute.tag }, { staleTime: 600000 })    
    const { data, isError } = useGetAttributeValues({ tags: _.join(tags, ";"), attribute_tag : attribute.tag}, { enabled: labelsFound})    
        
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
            _.isObject(allSubmissionAttributeValues) && _.has(allSubmissionAttributeValues, "attribute_value_tags") && _.has(allSubmissionAttributeValues, "count") ?
                allSubmissionAttributeValues.attribute_value_tags.map(attribute_value_tag => {
                    const attribute_value = allSubmissionAttributeValues.attribute_values_by_tag[attribute_value_tag]
                    const isSelected = _.has(submissionFilter,"attribute_value_tag") && submissionFilter["attribute_value_tag"].filter(attr => attr.tag === attribute_value.tag).length > 0
                    if (!_.isObject(attribute_value)) return null 
                    const count = labelsFound ? _.isObject(data) && _.has(data,["count",attribute_value_tag]) ? data.count[attribute_value_tag].count : 0 : allSubmissionAttributeValues.count[attribute_value_tag].count
                    return <motion.div key={`${attribute_value_tag}-${count}`}  className="flex bg--grey center-items"
                        whileHover={{ color: "#000", backgroundColor: "#fafafa" }}>
                        <motion.button
                                disabled={count === 0}
                                onClick={() => handleClick(attribute_value)}
                                className={`attribute__filter__button ${isSelected ?"attribute__filter_button--selected":""}`}
                                transition={{ duration: 0.1 }}>
                            {attributeIsFeature ? `${attribute_value.gene_name} (${count})` : `${attribute_value.text} (${count})`}
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


/**
 * @description Select attributes to filter submissions
 * @param {object} props 
 * @param {String[]} props.tags - List of attribute tags used to filter the submissions. 
 * @returns 
 */
export function AttributeSubmissionFilter({ setSubmissionFilter, submissionFilter, attributesByTag, tags }) {

   
    return (
        <div className="margin-top--little" style={{width : "100%"}}>
           
        </div>
    )
}
