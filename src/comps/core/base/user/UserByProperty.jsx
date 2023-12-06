import { getCountsByGroups, getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesAndCountsFromList, getUniqueValuesFromArrayOfObjectsByKey, groupListByProperty } from "../../../../services/arrays/groupby"
import _ from "lodash"
import { createDataTree, nestLinearArrayByLink } from "../../../../services/arrays/nest"
import { AttributeFilterButton } from "../../../submission/view/SubmissionContainer"
import { InputGroup } from "@blueprintjs/core"

export function HierarchicalUserView({ users, userLabelsInSubmission, submissionFilter, setSubmissionFilter, firstLevel = "institute", secondLevel = "research_group"}) {
    //groups user by institute and research group
    const groupedUser = groupListByProperty(users, firstLevel)
    const researchGroupGroupedUser = _.fromPairs(_.keys(groupedUser).map(instName => [instName,groupListByProperty(groupedUser[instName],secondLevel)]))
    return (
        <div>
            <h3>Users</h3>
            <InputGroup fill={true} small={true} placeholder="Search user.." />
        <div className="flex flex-column"
            style={{
                height: "25vh",
                overflowY: "scroll",
                overflowX: "hidden",
                paddingTop: "0.2rem",
                marginTop: "0.3rem"
            }}>
            {_.keys(groupedUser).map(instituteName => {
                return <div className="flex flex-column" key={instituteName}>
                    <h5>{instituteName}</h5>
                    {_.keys(researchGroupGroupedUser[instituteName]).map(research_group => {
                        return <div className="flex flex-column intent-margin-left--little" key={`${research_group}-${instituteName}`}><h5>{research_group}</h5>
                            {researchGroupGroupedUser[instituteName][research_group].map(user => <AttributeFilterButton
                                submissionKey={"users"}
                                submissionFilter={submissionFilter}
                                setSubmissionFilter={setSubmissionFilter}
                                numberSubmissionWithTag={userLabelsInSubmission.values.has(user.label)?userLabelsInSubmission.counts[user.label]:0}
                                attributeValue={{ name: `${user.firstname} ${user.lastname}`, tag: user.label }} />)}
                        </div>
                    })}
                </div>
        })}


                    </div>
                    </div>
    )
}

// {_.keys(groupedUser).map(instituteName => {
//     return <div className="flex flex-column"><h5>{instituteName}</h5>
        
//         {_.keys(researchGroupGroupedUser[instituteName]).map(research_group => {
//             return
//         })}</div>
// })}
