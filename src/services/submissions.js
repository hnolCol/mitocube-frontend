import _ from "lodash"



export function filterSubmissionByDatasetAttribute({ submissionFilter, submissionDatasetAttributes, datasetAttributeFilter,  }) {
    const allFilterKeysFound = _.every(datasetAttributeFilter.map(filterKey => _.has(submissionDatasetAttributes, filterKey)))
    if (!allFilterKeysFound) return false
    const datasetAttributeMatch = _.every(datasetAttributeFilter.map(filterKey => _.some(submissionDatasetAttributes[filterKey].map(attributeValue => submissionFilter[filterKey].has(attributeValue.tag)))))
    return datasetAttributeMatch
}

// export function extractSubmissionDetails({ submissions }) {
    
    
//     const uniqueAtributesInSubmissions = getUniqueSetsOfAllValuesinArrayOfObjects(submissions.map(s => s.dataset_attributes),submissions.map(s => s.attributes))
//     const usersByDataLabel = Object.fromEntries(submissions.map(submission => [submission.label,_.concat(submission.collaborators, submission.user_label)]))
//     return { uniqueAtributesInSubmissions, usersByDataLabel}
    
// }

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