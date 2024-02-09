import PropTpyes, { array } from "prop-types"
import { getUniqueSetsOfAllValuesinArrayOfObjects, groupListByProperty } from "../../../services/arrays/groupby"
import _ from "lodash"
import { SubmissionItem } from "./SubmissionItem"
import { useMemo, useState } from "react"
import { isHexColorLight } from "../../../services/colors"
import { titleFormat } from "../../../services/format/string"
import {motion, useAnimation} from "framer-motion"
import { Button, Icon, InputGroup } from "@blueprintjs/core"
import TextInput from "../../core/input/Text"
import { filterArrayBySearchString, filterArrayOfObjects } from "../../../services/arrays/filter"
import { useGetSubmissionStates, useGetSubmissionByQuery } from "../../../hooks/queries/submission.hooks"
import { SubmissionBaseFilter } from "../filter"
import { StateSelection } from "../filter/StateSelection"
import { TextButtonIcon } from "../../core/svg/icons/filter/TextIcon"
import Loading from "../../core/base/loading"
import useDebounce from "../../../hooks/useDebounce"
import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms"
import TooltipButton from "../../core/base/buttons/TooltipButton"
import { AttributeSelection } from "../filter/AttributeSelection"
import { UserSelection } from "../filter/UserSelection"





AttributeFilterButton.propTypes = {
    /**
     * Attribute value used to display the filter button.
     */
    attributeValue: PropTpyes.object.isRequired,
    
}



/**
 * Attribute Filter Button. A JSX Component that animates a filter icon. 
 * Selecting the filter button leads to a filter by the given attribute tag, which is defined
 * as the attributeValue
 * @param {Object} props - The props
 * @param {import("../../../types/attributes").Attribute} props.attribute
 * @param {import("../../../types/attributes").AttributeValue | import("../../../types/feature").Feature} props.attributeValue Attribute value used to display the filter button.
 * @param {string} props.submissionKey - The submissionKey to be used for filtering by the Attribute Value.
 * @param {Function} props.setSubmissionFilter - The function be called when the button is clicked. Returns the prevValues and [submissionKey] : Set() using the attribute tag.
 * @param {Object} props.backgroundColors - The background color to be used for the button. Must contain the the submissionKey
 * @param {number} props.numberSubmissionWithTag - The number of submission that do actually contain this tag.
 * @returns The JSX Element :: AttributeFilter Button
 */
export function AttributeFilterButton({
    attribute,
    attributeValue,
    submissionKey,
    setSubmissionFilter,
    submissionFilter,
    backgroundColors = {},
    numberSubmissionWithTag
}) {
    
    if (!_.isObject(attribute)) return null 
    const isFilterKeyActive = _.has(submissionFilter, submissionKey) && submissionFilter[submissionKey].size > 0
    const attrValueTag = attributeValue.tag
    const isFilterActive = isFilterKeyActive ? submissionFilter[submissionKey].has(attrValueTag ) : false 
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
	const divAnimationControls = useAnimation();
	const divAnimationVariants = {
	    init: {
            opacity: 0,
            width : "0rem"
            
	    },
	    anim: {
            opacity: 0.8,
            width: "1.3rem",
            
		transition: {
            type: "linear"
	      },
	    }
    }
    const handleClick = () => {
        
        let itemsForFiltering = isFilterKeyActive ? submissionFilter[submissionKey] : new Set()
        if (!isFilterActive) {
            itemsForFiltering.add(attrValueTag)
        }
        else {
            itemsForFiltering.delete(attrValueTag)
        }
        if (itemsForFiltering.size === 0) {
            let updatedSubmissionFilter = { ...submissionFilter }
            delete updatedSubmissionFilter[submissionKey]
            setSubmissionFilter(updatedSubmissionFilter)
        }
        else {
            setSubmissionFilter(prevValues => {return {...prevValues, [submissionKey] : itemsForFiltering }})
        }
        
    }
    const bgColor = _.has(backgroundColors, submissionKey) ? backgroundColors[submissionKey] : isFilterActive ? "#b91d17" : "#dedede"
    
    return (<motion.button
        onClick={handleClick}
        className = "submssion__filter__button margin--little"
        style={{
            backgroundColor: bgColor,
            opacity : !isFilterActive && isFilterKeyActive ? 0.3 : 1.0,
            color: isHexColorLight(bgColor) ? "black" : "white"
        }}
        onHoverStart={() => {
            if (!isAnimationPlaying) {
                setIsAnimationPlaying(true)
                divAnimationControls.start(divAnimationVariants.anim)}
        }}
        onHoverEnd={() => {
            divAnimationControls.start(divAnimationVariants.init)
        }}
    >
    
        <div className="flex  justify-space-between">
        <div className="padding--little" style={{marginRight : "1.5rem", display:"inline-block"}}>
            {attribute.has_features_value? attributeValue.genes : attributeValue.text}{_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:""}
        </div>
        <motion.div style={{opacity : 0, width : "0rem"}} onAnimationComplete={() => {
            setIsAnimationPlaying(false)
            }} animate={divAnimationControls}>
                <div className="flex center-items" style={{ height: "100%" }}>
                    <div><Icon icon={isFilterActive ? "filter-remove" : "filter-keep"}/>
                    </div>
                </div>
        </motion.div>
        </div>
    </motion.button>
    )
}





export function StateIndicator({ state, padding = "little" }) {
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    if (submissionStatesLoading) return null 
    if (!_.has(submissionStates.states_inv,state)) return null 
    const stateName = submissionStates.states_inv[state]
    const stateColor = submissionStates.colors_inv[state]

    return <div className="flex"><div className={`flex flex-column center-items div--round padding--${padding}`}style={{
        backgroundColor: stateColor,
        fontSize : "1.1rem",
        color: isHexColorLight(stateColor) ? "black" : "white"
    }}>{titleFormat(stateName)}
    </div></div>
}

export function StateHeader({stateName, stateColor}) {
    return <div className="submission__state__header" style={{
        backgroundColor: stateColor,
        color: isHexColorLight(stateColor) ? "black" : "white"
    }}>{titleFormat(stateName)}
    </div>
}

SubmissionContainer.propTypes = {
    states: PropTpyes.object.isRequired,
    submissions: PropTpyes.arrayOf(PropTpyes.object).isRequired,
    attributesByTag : PropTpyes.object.isRequired
}


// export function AttributeFilter({ attributesInSubmission: { } }) {
    
//     return (<div className="flex flex-column">
        
//     </div>)
// }

// export function AttributeFilterSelection({uniqueAtributesInSubmissions, attributesByTag, setSubmissionFilter, submissionFilter,attributeSearchQuery, setAttributeSearchQuery}) {
//     //const attributeTags = Object.keys(uniqueAtributesInSubmissions)
//     const attribteValuesByTag = attributesByTag.attribute_values
//     const attribtesByTag = attributesByTag.attributes
//     //{Object.keys(uniqueAtributesInSubmissions).map(attributeTag => <AttributeFilterButton {...{attributeValue : attributeTag, submissionKey : attributeTag, submissionFilter, setSubmissionFilter}}/>)}
//     const { filteredAtributes } = useMemo(() => {
//         //use memo to filter based on a query.
//         let attributeTags = Object.keys(uniqueAtributesInSubmissions)
//         if (attributeSearchQuery.length < 2) return {
//             filteredAtributes: attributeTags.filter(attributeTag => _.has(uniqueAtributesInSubmissions[attributeTag],"attribute.allow_as_filter") && uniqueAtributesInSubmissions[attributeTag].attribute.allow_as_filter),
//             filteredAttributeTags: new Set()
//         }
//         else {
//             //first check attributes match the query
//             let attributeTagsMatchingFilterString = filterArrayBySearchString({
//                 array: attributeTags.filter(attributeTag => attribtesByTag[attributeTag].allow_as_filter).map(attributeTag => attribtesByTag[attributeTag]),
//                 keyNames: ["tag", "text"], searchString: attributeSearchQuery
//             })
//             //then find the attribute Values that match the query.
//             // optiona TO DO: one could add the tag and name of the attribute to the values to iteratte only through a single array
//             let filteredAttributeValuesByTag = Object.fromEntries(attributeTags.map(attrTag => {
//                 return [attrTag, filterArrayBySearchString({
//                     array: [...uniqueAtributesInSubmissions[attrTag].values].map(attrValueTag => _.has(attribteValuesByTag,attrValueTag)?attribteValuesByTag[attrValueTag]:{tag:attrValueTag}),
//                     searchString: attributeSearchQuery,
//                     keyNames: ["tag", "text", "details"]
//                 })]
//             }).filter(attrValues => attrValues[1].length > 0))
            
//             return {
//                 filteredAtributes: _.uniq(_.concat(
//                     attributeTags.filter(attributeTag => attribtesByTag[attributeTag].allow_as_filter && _.has(filteredAttributeValuesByTag, attributeTag)),
//                     attributeTagsMatchingFilterString.map(attribute => attribute.tag)
//                 ))
//             }
//         }
//     }, [attributeSearchQuery])

//     return (
//         <div>
//             <h3>Attributes</h3>
//             <InputGroup placeholder="Search attribute.." small={true} value={attributeSearchQuery} onValueChange={(query) => setAttributeSearchQuery(query)}/>
//         <div className="flex flex-column" style={{height : "33vh", overflowY : "scroll", overflowX: "hidden", paddingTop : "0.2rem", marginTop : "0.3rem"}}>
//             {filteredAtributes.map(attrTag => {
//                 const { values, counts, attributeValues, attribute } = uniqueAtributesInSubmissions[attrTag]
//                 if (values.size === 0) return null 
//                 if (!_.isObject(attribute)) return null 
//                 return (<div key={`${attrTag}-attr-filter`} className="flex flex-column">
//                     <div><h5>{attribtesByTag[attrTag].text}</h5></div>
//                     {[...values].map(attributeValueTag => {
//                         const attrValue = attributeValues[attributeValueTag]
//                     // let attrValue = _.has(attribteValuesByTag,attribteValueTag)?attribteValuesByTag[attribteValueTag]: createFakeAttributeValue({attribute : attribtesByTag[attrTag], numericInput : attribteValueTag})
//                         return <AttributeFilterButton key={`${attrTag}-${attributeValueTag}`} {...{
//                         attribute,
//                         attributeValue: attrValue,
//                         submissionKey: attrTag,
//                         setSubmissionFilter,
//                         submissionFilter,
//                         numberSubmissionWithTag : counts[attributeValueTag]
//                     }} />
//                 })}</div>)
//             })}
//             </div>
//             </div>
        
//     )
// }


export function filterSubmissionByDatasetAttribute({ submissionFilter, submissionDatasetAttributes, datasetAttributeFilter,  }) {
    const allFilterKeysFound = _.every(datasetAttributeFilter.map(filterKey => _.has(submissionDatasetAttributes, filterKey)))
    if (!allFilterKeysFound) return false
    const datasetAttributeMatch = _.every(datasetAttributeFilter.map(filterKey => _.some(submissionDatasetAttributes[filterKey].map(attributeValue => submissionFilter[filterKey].has(attributeValue.tag)))))
    return datasetAttributeMatch
}

export function extractSubmissionDetails({ submissions }) {
    
    
    const uniqueAtributesInSubmissions = getUniqueSetsOfAllValuesinArrayOfObjects(submissions.map(s => s.dataset_attributes),submissions.map(s => s.attributes))
    const usersByDataLabel = Object.fromEntries(submissions.map(submission => [submission.label,_.concat(submission.collaborators, submission.user_label)]))
    return { uniqueAtributesInSubmissions, usersByDataLabel}
    
}


export function filterSubmissions({ submissions, submissionFilter, submissionsQuery, usersByDataLabel, ignoreState = false }) {

    const stateFilterIsActive = _.has(submissionFilter, "states") && submissionFilter.states.size > 0
    const datasetAttributeFilter = _.keys(submissionFilter).filter(filterKey => filterKey !== "states" && filterKey !== "users") //exclude statefilter and user filter
    const userSearchActive = _.has(submissionFilter, "users") && submissionFilter.users.size > 0 
    
    // should be combined in a single iteration...
    let filteredSubmission = submissions
    if (stateFilterIsActive && !ignoreState) {
        filteredSubmission = filteredSubmission.filter(submission => submissionFilter.states.has(_.toInteger(submission.state)))
    }
    //filter by dataset attributes
    if (datasetAttributeFilter.length > 0){
        filteredSubmission = submissions.filter(submission => filterSubmissionByDatasetAttribute({
            submissionFilter,
            submissionDatasetAttributes: submission.dataset_attributes,
            datasetAttributeFilter
        }))
    }
    if (submissionsQuery.plain !== "") {
        //filter by plain serach
        filteredSubmission = filterArrayBySearchString({
            array: submissions,
            keyNames: ["title", "label"],
            searchString: submissionsQuery.plain
        })
    }

    if (userSearchActive) {
        // filter by user
        filteredSubmission = filteredSubmission.filter(submission => _.some(usersByDataLabel[submission.label].map(userLabel => submissionFilter.users.has(userLabel))))
    }

    return filteredSubmission
}


export function SubmissionContainer({ states, attributesByTag, users, submissionFilter, setSubmissionFilter, setAttributeSelectionDialog,submissionsQuery, setSubmissionQuery, setAttributesDialog, setRunlistDialog}) {
    
    const [searchString, setSearchString] = useState("")
    const debouncedString = useDebounce(searchString, 200)
    const stateFilter = _.has(submissionFilter,"states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states),";") : null

    const { data: submissionQuery, isLoading, isFetching, isSuccess, isError, error } = useGetSubmissionByQuery({
        query: debouncedString.length === 0 ? null : debouncedString,
        state: stateFilter,
        attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
        attribute_value_tag: getValueByKeyAndMergeToString({array : submissionFilter["attribute_value_tag"], keyName : "tag"})
        //attribute_tag : 
    })
    
    //const {submissions, query_count, total_count, labels} = submissionQuery
   // let labelsCombined = _.isArray(submissions) ? _.join(submissions.map(submission => submission.label)) : ""
    //const { uniqueAtributesInSubmissions, usersByDataLabel } = extractSubmissionDetails({ submissions })
    //console.log(uniqueAtributesInSubmissions)
    const usersByLabel = groupListByProperty(users, "label")
    //const filteredSubmission = filterSubmissions({submissions, submissionFilter,submissionsQuery,usersByDataLabel})
    const submissionsByState = isSuccess ? groupListByProperty(submissionQuery.submissions, "state") : {}
    //const userLabelsInSubmission = getUniqueValuesAndCountsFromList(filteredSubmission.map(submission => _.concat(submission.collaborators, submission.user_label)))
    //console.log(attributesByTag.attributes)
   
    return (
        <div><h2>Submissions ({isSuccess? submissionQuery.query_count:null}/{isSuccess? submissionQuery.total_count:null})</h2>
            {/* <TextButtonIcon /> */}
        <div className="flex" style={{ width: "100%" }}>
        
                <div className="flex flex-column submission__side__filter__container ">
                    <div className="flex" style={{minWidth: "100%"}}>
                    <InputGroup value={searchString} fill = {true} placeholder="Search..." small={true} onValueChange={value => setSearchString(value)} rightElement={<Button minimal={true} loading={isLoading || isFetching}/>}/>
                    <TooltipButton content="Clear filter selection." icon="cross" small={true} onClick={() => setSubmissionFilter({})} intent={_.isEmpty(submissionFilter) ? "none" : "danger"} />
                    
                    </div>

                    <StateSelection {...{ states, submissionsByState, submissionFilter, setSubmissionFilter }} /> 
                    <AttributeSelection attributesByTag={attributesByTag.attributes} labels={isSuccess ? submissionQuery.labels : []} {...{ setSubmissionFilter, submissionFilter }} />
                    <UserSelection {...{submissionFilter, setSubmissionFilter, labels: isSuccess ? submissionQuery.labels : []}} />
                    {/* <SubmissionBaseFilter {...{
                    submissionFilter,
                    submissionsQuery,
                    setSubmissionFilter,
                    setSubmissionQuery,
                    attributesByTag,
                    userLabelsInSubmission,
                    //uniqueAtributesInSubmissions,
                    users,
                    states,
                    submissionsByState
                }} /> */}
            </div>

        <div className="submission__items__container">
                    {_.isEmpty(submissionsByState) ? <p>No submission found that match the filter.</p> : null}
                    {isError?<p>An error was returned when searching.</p>:null}
            {Object.values(states.states).map((state,stateIdx) => {
                const submissionsAreInState = _.has(submissionsByState, state)
                if (!submissionsAreInState) return null 
                
                return (
                    <div key={`${stateIdx}-${state}`} className="flex flex-column submission__state_container">
                        
                        <StateHeader {...{
                            stateName: states.states_inv[state],
                            stateColor: states.colors_inv[state]
                        }} />
                        {isLoading || isFetching ? <Loading /> : submissionsByState[_.toString(state)].map((submission,submissionIdx) => {
                            //key are always strings .... 
                            return (
                                <SubmissionItem
                                    key={submission.label}
                                    {...{
                                    stateName : states.states_inv[state], 
                                    states,
                                    usersByLabel,
                                    submission,
                                    setAttributeSelectionDialog,
                                    attributesByTag : attributesByTag.attributes,
                                    attributeValuesByTag: attributesByTag.attribute_values,
                                    setAttributesDialog,
                                    setRunlistDialog,
                                    minimalView : submissionsQuery.minimalView
                                    
                                }} borderColor={states.colors_inv[state]} />
                            )
                        })}
                    </div>
                )
            })}

            </div>
            </div>
            </div>
    )
}
