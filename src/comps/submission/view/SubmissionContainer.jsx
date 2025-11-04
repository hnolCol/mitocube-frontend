import PropTypes, { array } from "prop-types"
import { getUniqueSetsOfAllValuesinArrayOfObjects, groupListByProperty } from "../../../services/arrays/groupby"
import _ from "lodash"
import { MinimalSubmissionItem } from "./SubmissionItem"

import { getValueByKeyAndMergeToString } from "../../../services/arrays/transforms"
import { SubmissionFilterSelection } from "../filter"
import { filterSubmissions } from "../../../services/submissions"


import hooks from "@mitocube/api-hooks"
import { StateHeader } from "./StateHeader"


// AttributeFilterButton.propTypes = {
//     /**
//      * Attribute value used to display the filter button.
//      */
//     attributeValue: PropTpyes.object.isRequired,
    
// }



// /**
//  * Attribute Filter Button. A JSX Component that animates a filter icon. 
//  * Selecting the filter button leads to a filter by the given attribute tag, which is defined
//  * as the attributeValue
//  * @param {Object} props - The props
//  * @param {import("../../../types/attributes").Attribute} props.attribute
//  * @param {import("../../../types/attributes").AttributeValue | import("../../../types/feature").Feature} props.attributeValue Attribute value used to display the filter button.
//  * @param {string} props.submissionKey - The submissionKey to be used for filtering by the Attribute Value.
//  * @param {Function} props.setSubmissionFilter - The function be called when the button is clicked. Returns the prevValues and [submissionKey] : Set() using the attribute tag.
//  * @param {Object} props.backgroundColors - The background color to be used for the button. Must contain the the submissionKey
//  * @param {number} props.numberSubmissionWithTag - The number of submission that do actually contain this tag.
//  * @returns The JSX Element :: AttributeFilter Button
//  */
// export function AttributeFilterButton({
//     attribute,
//     attributeValue,
//     submissionKey,
//     setSubmissionFilter,
//     submissionFilter,
//     backgroundColors = {},
//     numberSubmissionWithTag
// }) {
    
//     if (!_.isObject(attribute)) return null 
//     const isFilterKeyActive = _.has(submissionFilter, submissionKey) && submissionFilter[submissionKey].size > 0
//     const attrValueTag = attributeValue.tag
//     const isFilterActive = isFilterKeyActive ? submissionFilter[submissionKey].has(attrValueTag ) : false 
//     const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
// 	const divAnimationControls = useAnimation();
// 	const divAnimationVariants = {
// 	    init: {
//             opacity: 0,
//             width : "0rem"
            
// 	    },
// 	    anim: {
//             opacity: 0.8,
//             width: "1.3rem",
            
// 		transition: {
//             type: "linear"
// 	      },
// 	    }
//     }
//     const handleClick = () => {
        
//         let itemsForFiltering = isFilterKeyActive ? submissionFilter[submissionKey] : new Set()
//         if (!isFilterActive) {
//             itemsForFiltering.add(attrValueTag)
//         }
//         else {
//             itemsForFiltering.delete(attrValueTag)
//         }
//         if (itemsForFiltering.size === 0) {
//             let updatedSubmissionFilter = { ...submissionFilter }
//             delete updatedSubmissionFilter[submissionKey]
//             setSubmissionFilter(updatedSubmissionFilter)
//         }
//         else {
//             setSubmissionFilter(prevValues => {return {...prevValues, [submissionKey] : itemsForFiltering }})
//         }
        
//     }
//     const bgColor = _.has(backgroundColors, submissionKey) ? backgroundColors[submissionKey] : isFilterActive ? "#b91d17" : "#dedede"
    
//     return (<motion.button
//         onClick={handleClick}
//         className = "submission__filter__button margin--little"
//         style={{
//             backgroundColor: bgColor,
//             opacity : !isFilterActive && isFilterKeyActive ? 0.3 : 1.0,
//             color: isHexColorLight(bgColor) ? "black" : "white"
//         }}
//         onHoverStart={() => {
//             if (!isAnimationPlaying) {
//                 setIsAnimationPlaying(true)
//                 divAnimationControls.start(divAnimationVariants.anim)}
//         }}
//         onHoverEnd={() => {
//             divAnimationControls.start(divAnimationVariants.init)
//         }}
//     >
    
//         <div className="flex  justify-space-between">
//         <div className="padding--little" style={{marginRight : "1.5rem", display:"inline-block"}}>
//             {attribute.has_features_value? attributeValue.gene_names : attributeValue.text}{_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:""}
//         </div>
//         <motion.div style={{opacity : 0, width : "0rem"}} onAnimationComplete={() => {
//             setIsAnimationPlaying(false)
//             }} animate={divAnimationControls}>
//                 <div className="flex center-items" style={{ height: "100%" }}>
//                     <div><Icon icon={isFilterActive ? "filter-remove" : "filter-keep"}/>
//                     </div>
//                 </div>
//         </motion.div>
//         </div>
//     </motion.button>
//     )
// }




SubmissionsByState.propTypes = {
    submissionFilter: PropTypes.object.isRequired,
    submissionsQuery: PropTypes.object.isRequired,
    minimal: PropTypes.bool
}

SubmissionsByState.defaultProps = {
    minimal: true
}
/**
 * @description The component that displays a list of submissions grouped by their state.
 * It uses the SubmissionItem component to display each submission.
 * @param {Object} props - The props object.
 * @param {Object} props.submissionFilter - The submission filter object.
 * @param {Object} props.submissionsQuery - The submissions query object.
 * @param {boolean} [props.minimal = true] - If true, uses MinimalSubmissionItem, otherwise uses SubmissionItem.
 * @returns {JSX.Element} The SubmissionsByState component.
 */
export function SubmissionsByState({ submissionFilter, submissionsQuery, minimal}) {

    const stateFilter = _.has(submissionFilter,"states") && submissionFilter.states.size > 0 ? _.join(Array.from(submissionFilter.states),";") : null
    const { data: submissionStates } = hooks.submissions.states.useGetStates()
    const { data: submission_by_state, isLoading, isFetching, isSuccess, isError, error } = hooks.submissions.query.useGetSubmissionByQuery({
            search_string: submissionsQuery.plain.length === 0 ? null : submissionsQuery.plain,
            group_by_state : true,
            state: stateFilter,
            genotype_tag: getValueByKeyAndMergeToString({ array: submissionFilter["genotype_tag"], keyName: "tag" }),
            user_tag: getValueByKeyAndMergeToString({ array: submissionFilter["user"], keyName: "tag" }),
            attribute_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_tag"], keyName: "tag" }),
            attribute_value_tag: getValueByKeyAndMergeToString({ array: submissionFilter["attribute_value_tag"], keyName: "tag" })
        })

    return (

        <div>
            {_.isArray(submissionStates) && submissionStates
                .filter(state_tag => _.has(submission_by_state, state_tag) && _.isArray(submission_by_state[state_tag]) && submission_by_state[state_tag].length > 0)
                .map((state_tag, idx) => {
                    return <div key={`${state_tag}-${idx}`}>
                        <StateHeader key={`${idx}-${state_tag}`} tag={state_tag} />
                        <div className="flex flex-column padding-left--little margin-bottom--little">
                        {submission_by_state[state_tag].map((submission_tag, submissionIdx) => {
                            return (
                                <div key={`${submission_tag}-${submissionIdx}`}>
                                    {/* // If minimalView is true, use MinimalSubmissionItem, otherwise use SubmissionItem */}
                                    {minimal ? <MinimalSubmissionItem tag={submission_tag} /> : null}
                                </div>
                            )
                        })}
                            </div>
                    </div>
            }) }
        </div>

    )

}



SubmissionContainer.propTypes = {
    submissionFilter: PropTypes.object.isRequired,
    setSubmissionQuery: PropTypes.func.isRequired,
    setSubmissionFilter: PropTypes.func.isRequired,
    setAttributeSelectionDialog: PropTypes.func.isRequired,
}



export function SubmissionContainer({ submissionFilter, setSubmissionFilter, setAttributeSelectionDialog, submissionsQuery, setSubmissionQuery, setAttributesDialog, setRunlistDialog, setChangeOwnerDialog}) {
    
    return (
        <div>
            <SubmissionFilterSelection {...{
                submissionFilter,
                setSubmissionFilter,
                submissionsQuery,
                setSubmissionQuery,
                // isLoading,
                // isFetching,
                // isSuccess,
                // isError
            }}
                children={
                    
                    <div>
                        <SubmissionsByState submissionFilter={submissionFilter} submissionsQuery={submissionsQuery} />
                    </div>
                }
            />
        </div>

    )
}
