import PropTpyes from "prop-types"
import { getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesAndCountsFromList, groupListByProperty } from "../../../services/arrays/groupby"
import _ from "lodash"
import { SubmissionItem } from "./SubmissionItem"
import { useMemo, useState } from "react"
import { isHexColorLight } from "../../../services/colors"
import { titleFormat } from "../../../services/format/string"
import {motion, useAnimation} from "framer-motion"
import ColorIconWithName from "../../core/svg/icons/chartSelection/Color"
import { Button, Icon, InputGroup } from "@blueprintjs/core"
import { useGetPublicUserInfo } from "../../../hooks/queries/user.hooks"
import { User, UserIcon, UserIconWithTooltip } from "../../core/base/user"
import TextInput from "../../core/input/Text"
import { filterArrayBySearchString, filterArrayOfObjects } from "../../../services/arrays/filter"
import { useGetSubmissionStates } from "../../../hooks/queries/submission.hooks"
import { SubmissionBaseFilter } from "../filter"




export function AttributeFilterButton({ attributeValue, submissionKey, setSubmissionFilter, submissionFilter, backgroundColors = {}, numberSubmissionWithTag = undefined,  }) {
    // Attribute Filter Button
    // submssion Key === attribute.tag
    // 
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
        
        let itemsForFiltering = isFilterKeyActive?submissionFilter[submissionKey]: new Set()
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
    const bgColor = _.has(backgroundColors,submissionKey)?backgroundColors[submissionKey]:isFilterActive?"#b91d17":"#dedede"
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
            {titleFormat(attributeValue.name)}{_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:""}
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


export function StateFilterButton({ states, stateName, setSubmissionFilter, submissionFilter ,numberSubmissionWithTag = undefined }) {
    const state = states.states[stateName]
    
    const stateFilterActive = _.has(submissionFilter, "states") && submissionFilter.states.size > 0

    const isStateFilter = stateFilterActive ? submissionFilter.states.has(state) : false    
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
        let statesForFiltering = stateFilterActive? submissionFilter.states: new Set()
        if (!stateFilterActive) {
            statesForFiltering.add(state)
        }
        else if (isStateFilter) {
            statesForFiltering.delete(state)
        }
        else {
            statesForFiltering.add(state)
        }

        setSubmissionFilter(prevValues => {return {...prevValues,states : statesForFiltering}})
    }

    return <motion.button
        onClick={handleClick}
        className = "submssion__filter__button margin--very-little"
        style={{
            backgroundColor: states.colors[stateName],
            opacity : !isStateFilter && stateFilterActive ? 0.3 : 1.0,
            color: isHexColorLight(states.colors[stateName]) ? "black" : "white"
        }}
       // whileHover={{ opacity: 1.0 }}
        onHoverStart={() => {
            if (!isAnimationPlaying) {
                setIsAnimationPlaying(true)
                divAnimationControls.start(divAnimationVariants.anim)}
        }}
        onHoverEnd={() => {
            divAnimationControls.start(divAnimationVariants.init)
        }}
        >
        <div className="flex justify-space-between">
        <div className="padding--little">
            {titleFormat(stateName)}{_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:""}
        </div>
        <motion.div style={{opacity : 0, width : "0rem"}} onAnimationComplete={() => {
            setIsAnimationPlaying(false)
            }} animate={divAnimationControls}>
                <div className="flex center-items" style={{ height: "100%" }}>
                    <div><Icon icon={isStateFilter ? "filter-remove" : "filter-keep"}/>
                    </div>
                </div>
        </motion.div>
        </div>
    </motion.button>

}

export function StateIndicator({ state, authenticationStatus }) {
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates({ tokenString: authenticationStatus.token },
        { staleTime: Infinity }) //request only once. 
    if (submissionStatesLoading) return null 
    const stateName = submissionStates.states_inv[state]
    const stateColor = submissionStates.colors_inv[state]

    return <div className="flex"><div className="flex flex-column center-items div--round padding--little" style={{
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


export function AttributeFilter({ attributesInSubmission: { } }) {
    
    return (<div className="flex flex-column">
        
    </div>)
}

export function AttributeFilterSelection({uniqueAtributesInSubmissions, attributesByTag, setSubmissionFilter, submissionFilter,attributeSearchQuery, setAttributeSearchQuery}) {

    //const attributeTags = Object.keys(uniqueAtributesInSubmissions)
    
    const attribteValuesByTag = attributesByTag.attribute_values
    const attribtesByTag = attributesByTag.attributes
    //{Object.keys(uniqueAtributesInSubmissions).map(attributeTag => <AttributeFilterButton {...{attributeValue : attributeTag, submissionKey : attributeTag, submissionFilter, setSubmissionFilter}}/>)}
    const { filteredAtributes } = useMemo(() => {
        //use memo to filter based on a query.
        let attributeTags = Object.keys(uniqueAtributesInSubmissions)
        if (attributeSearchQuery.length < 2) return {
            filteredAtributes: attributeTags.filter(attributeTag => attribtesByTag[attributeTag].allow_as_filter),
            filteredAttributeTags: new Set()
        }
        else {
    
            let attributeTagsMatchingFilterString = filterArrayBySearchString({
                array: attributeTags.filter(attributeTag => attribtesByTag[attributeTag].allow_as_filter).map(attributeTag => attribtesByTag[attributeTag]),
                searchColumns: ["tag", "name"], searchString: attributeSearchQuery
            })
           // console.log(filterArrayBySearchString({ array: [...uniqueAtributesInSubmissions[attributeTags[0]].values].map(attrValueTag => attribteValuesByTag[attrValueTag]), searchString : query, searchColumns : ["tag", "name"]}))
            let filteredAttributeValuesByTag = Object.fromEntries(attributeTags.map(attrTag =>
                [attrTag, filterArrayBySearchString({
                    array: [...uniqueAtributesInSubmissions[attrTag].values].map(attrValueTag => attribteValuesByTag[attrValueTag]),
                    searchString: attributeSearchQuery,
                    searchColumns: ["tag", "name","details"]
                })]).filter(attrValues => attrValues[1].length > 0))
            return {
                filteredAtributes: _.uniq(_.concat(
                    attributeTags.filter(attributeTag => attribtesByTag[attributeTag].allow_as_filter && _.has(filteredAttributeValuesByTag, attributeTag)),
                    attributeTagsMatchingFilterString.map(attribute => attribute.tag)
                ))
            }
        }
    }, [attributeSearchQuery])

    return (
        <div>
            <h3>Attributes</h3>
            <InputGroup placeholder="Search attribute.." small={true} value={attributeSearchQuery} onValueChange={(query) => setAttributeSearchQuery(query)}/>
        <div className="flex flex-column" style={{height : "33vh", overflowY : "scroll", overflowX: "hidden", paddingTop : "0.2rem", marginTop : "0.3rem"}}>
            {filteredAtributes.map(attrTag => {
                const { values, counts } = uniqueAtributesInSubmissions[attrTag]
                if (values.size === 0) return null 

                return (<div key={`${attrTag}-attr-filter`} className="flex flex-column">
                    <div><h5>{attribtesByTag[attrTag].name}</h5></div>
                    {[...values].map(attribteValueTag => {
                    let attrValue = _.has(attribteValuesByTag,attribteValueTag)?attribteValuesByTag[attribteValueTag]: {name : attribteValueTag, tag : attribteValueTag}
                    return <AttributeFilterButton key={`${attrTag}-${attribteValueTag}`} {...{
                        attributeValue: attrValue,
                        submissionKey: attrTag,
                        setSubmissionFilter,
                        submissionFilter,
                        numberSubmissionWithTag : counts[attribteValueTag]
                    }} />
                })}</div>)
            })}
            </div>
            </div>
        
    )
}


export function UserFilterSelection({ userLabelsInSubmission, usersByLabel, submissionFilter, setSubmissionFilter }) {
    const { values, counts } = userLabelsInSubmission
    return (<div>
        <h3>Users</h3>
        <div className="flex flex--wrap">
        {[...values].map(userLabel => {
            if (_.has(usersByLabel, userLabel)) {
                return <UserIconWithTooltip {...{userLabel, usersByLabel, selected : true}} /> // text = {userData.firstname[0]+userData.lastname[0]} />

            }})}
        </div>
    </div>)
}


export function filterSubmissionByDatasetAttribute({ submissionFilter, submissionDatasetAttributes, datasetAttributeFilter,  }) {
    
    const allFilterKeysFound = _.every(datasetAttributeFilter.map(filterKey => _.has(submissionDatasetAttributes, filterKey)))
    if (!allFilterKeysFound) return false
    const datasetAttributeMatch = _.every(datasetAttributeFilter.map(filterKey => _.some(submissionDatasetAttributes[filterKey].map(attrValueTags => submissionFilter[filterKey].has(attrValueTags)))))
    return datasetAttributeMatch
}

export function extractSubmissionDetails({ submissions }) {
    
    const uniqueAtributesInSubmissions = getUniqueSetsOfAllValuesinArrayOfObjects(submissions.map(s => s.dataset_attributes))
    const usersByDataLabel = Object.fromEntries(submissions.map(submission => [submission.label,_.concat(submission.collaborators, submission.user_label)]))
    
    return { uniqueAtributesInSubmissions, usersByDataLabel}
}


export function filterSubmissions({ submissions, submissionFilter, submissionsQuery, usersByDataLabel, ignoreState = false }) {

    const stateFilterIsActive = _.has(submissionFilter, "states") && submissionFilter.states.size > 0
    const datasetAttributeFilter = _.keys(submissionFilter).filter(filterKey => filterKey !== "states" && filterKey !== "users") //exclude statefilter
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
            searchColumns: ["title", "label"],
            searchString: submissionsQuery.plain
        })
    }

    if (userSearchActive) {
        // filter by user
        filteredSubmission = filteredSubmission.filter(submission => _.some(usersByDataLabel[submission.label].map(userLabel => submissionFilter.users.has(userLabel))))
    }

    return filteredSubmission


}

export function SubmissionContainer({ states, submissions, attributesByTag, users, submissionFilter, setSubmissionFilter, setAttributeSelectionDialog,submissionsQuery, setSubmissionQuery}) {

    
    
    //const datasetAttributeFilter = _.keys(submissionFilter).filter(filterKey => filterKey !== "states" && filterKey !== "users") //exclude statefilter
    
    const {uniqueAtributesInSubmissions,usersByDataLabel} = extractSubmissionDetails({submissions})
    // const uniqueAtributesInSubmissions = getUniqueSetsOfAllValuesinArrayOfObjects(submissions.map(s => s.dataset_attributes))
    // const usersByDataLabel = Object.fromEntries(submissions.map(submission => [submission.label,_.concat(submission.collaborators, submission.user_label)]))
    // const userLabelsInSubmission = getUniqueValuesAndCountsFromList(submissions.map(submission => _.concat(submission.collaborators, submission.user_label)))
    const usersByLabel = groupListByProperty(users, "label")
    const filteredSubmission = filterSubmissions({submissions, submissionFilter,submissionsQuery,usersByDataLabel})
    const submissionsByState = groupListByProperty(filteredSubmission, "state")
    const userLabelsInSubmission = getUniqueValuesAndCountsFromList(filteredSubmission.map(submission => _.concat(submission.collaborators, submission.user_label)))

    // const submissionMatchesFilterByIndex = Object.fromEntries(Object.keys(submissionsByState).map(
    //     state => [state, Object.fromEntries(_.map(submissionsByState[_.toString(state)], (submission, idx) => {
    //         return [idx, filterSubmissionByDatasetAttribute({
    //             submissionFilter,
    //             submissionDatasetAttributes: submission.dataset_attributes,
    //             datasetAttributeFilter
    //         })]
    //     }))]))
    
    
    // const submissionMatchingPlainQuery = useMemo(() => {
    //     if (submissionsQuery.plain === "") return new Set()
    //     return new Set(filterArrayBySearchString({ array: submissions, searchColumns: ["title", "label"], searchString: submissionsQuery.plain }).map(s => s.label))
    // }, [submissionsQuery.plain])
    
    
    // const plainSearchActive = submissionsQuery.plain !== ""
    // const userSearchActive = _.has(submissionFilter,"users") && submissionFilter.users.size > 0 
    //if (_.isEmpty(submissionsByState)) return <div><p>No submissions found. Please use the submission portal to start with your first one. Please visit the dataset sectio to explore published datasets.</p></div>
    return (
        <div className="flex" style={{ width: "100%" }}>
            
            <div className="flex flex-column submission__side__filter__container ">
            
                
                <h3>States</h3>
                <div className="flex flex-column">
                    {Object.keys(states.states).map(stateName => {
                        const state = states.states[stateName]
                        const numSubmssionsInState = _.has(submissionsByState,state)?submissionsByState[state].length:0
                        return <StateFilterButton
                        numberSubmissionWithTag={numSubmssionsInState}
                        key={stateName}
                        {...{ submissionFilter, setSubmissionFilter, stateName, states }} />})}
                </div>
                <SubmissionBaseFilter {...{
                    submissionFilter,
                    submissionsQuery,
                    setSubmissionFilter,
                    setSubmissionQuery,
                    attributesByTag,
                    userLabelsInSubmission,
                    usersByLabel,
                    uniqueAtributesInSubmissions,
                    users
                }} />
            </div>

        <div className="submission__items__container">
                {_.isEmpty(submissionsByState) ? <p>No submission found that match the filter.</p> : null}
            {Object.values(states.states).map((state,stateIdx) => {
                const submissionsAreInState = _.has(submissionsByState, state)
                if (!submissionsAreInState) return null 
                
                
                // if (stateFilterIsActive && !submissionFilter.states.has(_.toInteger(state))) return null
                // if (!_.some(Object.values(submissionMatchesFilterByIndex[state]))) return null 
                // if (plainSearchActive  && !_.some(submissionsByState[_.toString(state)].map(s => submissionMatchingPlainQuery.has(s.label)))) return null
                //console.log("reach?", plainSearchActive)
                return (
                    <div key={`${stateIdx}-${state}`} className="flex flex-column submission__state_container">
                        <StateHeader {...{
                            stateName: states.states_inv[state],
                            stateColor: states.colors_inv[state]
                        }} />
                        {submissionsByState[_.toString(state)].map((submission,submissionIdx) => {
                            // if (!submissionMatchesFilterByIndex[state][submissionIdx]) return null 
                            // if (plainSearchActive && !submissionMatchingPlainQuery.has(submission.label)) return null
                            // if (userSearchActive && !_.some(usersByDataLabel[submission.label].map(userLabel => submissionFilter.users.has(userLabel)))) return null
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
                                    attributeValuesByTag: attributesByTag.attribute_values
                                    
                                }} borderColor={states.colors_inv[state]} />
                            )
                        })}
                    </div>
                )
            })}

            </div>
            </div>
    )
}
