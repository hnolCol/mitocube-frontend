import { getCountsByGroups, getUniqueSetsOfAllValuesinArrayOfObjects, getUniqueValuesAndCountsFromList, getUniqueValuesFromArrayOfObjectsByKey, groupListByProperty } from "../../../../services/arrays/groupby"
import _ from "lodash"
import { AttributeFilterButton } from "../../../submission/view/SubmissionContainer"
import { Icon, InputGroup } from "@blueprintjs/core"
import { useState } from "react"
import { useAnimation } from "framer-motion"
import { isHexColorLight } from "../../../../services/colors"
import {motion} from "framer-motion"
import { getUserFullName } from "../../../../services/format/user"



export function UserLevelFilterButton({submissionKey = "users", userLabels, levelName ,setSubmissionFilter, submissionFilter, backgroundColors = {}, numberSubmissionWithTag = undefined,  }) {
    // Attribute Filter Button
    // submssion Key === attribute.tag
    // 
    const isFilterKeyActive = _.has(submissionFilter, submissionKey) && submissionFilter[submissionKey].size > 0
    const isFilterActive = isFilterKeyActive && _.every(userLabels, userLabel => submissionFilter[submissionKey].has(userLabel))
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
    const handleClick = (e) => {
        //handle selecting a first level or second level of the user hierarchy. 
        let isFilterActive = _.has(submissionFilter, submissionKey)
        let itemsForFiltering = isFilterActive ? submissionFilter[submissionKey] : new Set()
        if (!isFilterActive) {
            _.forEach(userLabels, (userLabel) => itemsForFiltering.add(userLabel))
        }
        else {
            
            if (_.every(userLabels, userLabel => itemsForFiltering.has(userLabel))) {
                itemsForFiltering = new Set()
            }
            else {
                _.forEach(userLabels, (userLabel) => !itemsForFiltering.has(userLabel) ? itemsForFiltering.add(userLabel) : null)
            }
            
        }
        if (itemsForFiltering.size === 0) {
            let updatedSubmissionFilter = { ...submissionFilter }
            delete updatedSubmissionFilter[submissionKey]
            setSubmissionFilter(updatedSubmissionFilter)
        }
        else {
            setSubmissionFilter(prevValues => { return { ...prevValues, [submissionKey]: itemsForFiltering } })
        }
    }
    
    const bgColor = _.has(backgroundColors,submissionKey)?backgroundColors[submissionKey]:isFilterActive?"#b91d17":"#dedede"
    return (<motion.button
        onClick={handleClick}
        className = "submission__filter__button margin--little"
        style={{
            backgroundColor: bgColor,
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
        <div className="padding--little" style={{marginRight : "1.2rem", textAlign : "left"}}>
            {levelName}{_.isNumber(numberSubmissionWithTag)?` (${numberSubmissionWithTag})`:""}
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
                    <UserLevelFilterButton {...{
                                setSubmissionFilter,
                                submissionFilter,
                                levelName : instituteName,
                                userLabels : _.flatten(_.values(researchGroupGroupedUser[instituteName])).map(u => u.label)
                            }} />
                    {_.keys(researchGroupGroupedUser[instituteName]).map(research_group => {
                        return <div className="flex flex-column margin-left--little" key={`${research_group}-${instituteName}`}>
                            <UserLevelFilterButton {...{
                                setSubmissionFilter,
                                submissionFilter,
                                levelName : research_group,
                                userLabels : researchGroupGroupedUser[instituteName][research_group].map(u => u.label)
                            }} />

                            {researchGroupGroupedUser[instituteName][research_group].map(user => <AttributeFilterButton
                                key={`${user.label}-attribute-filterbutton`}
                                submissionKey={"users"}
                                submissionFilter={submissionFilter}
                                setSubmissionFilter={setSubmissionFilter}
                                numberSubmissionWithTag={userLabelsInSubmission.values.has(user.label)?userLabelsInSubmission.counts[user.label]:0}
                                attributeValue={{ text: getUserFullName(user), tag: user.label }} />)}
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
