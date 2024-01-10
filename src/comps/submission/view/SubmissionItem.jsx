import { Button, ContextMenu, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { getFormatDateFromTimestamp } from "../../../services/date/format";
import { Header } from "../../core/base/Header";
import { AttributeTagWithTooltip, SampleAttributeTagWithTooltip, TagWithTooltip } from "../../core/base/tags/TagWithTooltip";
import { User, UserIcon, UserIconWithTooltip } from "../../core/base/user";
import { BaseDashboardIcon } from "../../core/svg/icons/dashboard/IconBase";
import UserDashboardIcon from "../../core/svg/icons/dashboard/User";

import { useState } from "react";
import MenuDashboardIcon from "../../core/svg/icons/dashboard/Menu";
import BasicMenu from "../../core/menu";
import _ from "lodash"
import { isHexColorLight } from "../../../services/colors";
import { titleFormat } from "../../../services/format/string";
import { motion } from "framer-motion";
import { copyTextToClipboard } from "../../../services/clipboard";
import { useNavigate } from "react-router";




function StateSubMenu({states, stateName, onStateChange}) {
    const inState = states.states[stateName]

    return (
        <Menu>
            {Object.keys(states.colors).map(sn => {
                const isInState = sn === stateName
                const state = states.states[sn]
                if (state > inState+1 && inState >= 0) return null 
                return <MenuItem
                    key = {sn}
                    className="submission__state__menuitem"
                    onClick={() => onStateChange(state)}
                    style={{
                        backgroundColor: states.colors[sn],
                        color: isHexColorLight(states.colors[sn]) ? "black" : "white",
                        fontWeight : isInState ? 600 : 300
                    }}
                    icon={isInState ? "tick" : "blank"}
                    text={titleFormat(sn)}
                />
            })}
        </Menu>
    )
}

/**
 * 
 * @param {Object} props
 * @param {import("../../../types/submissions").Submission} props.submission - The submission meta data.
 * @param {String} props.borderColor - The hex of the state color the submission is in.
 * @param {String} props.stateName - The actual state name the submission is in. Determined by the backend.
 * @returns 
 */
export function SubmissionItem({
    submission,
    borderColor,
    stateName,
    states,
    attributesByTag = {},
    attributeValuesByTag = {},
    setAttributeSelectionDialog,
    usersByLabel,
    setAttributesDialog,
    setRunlistDialog,
    contextMenuEnabled = true,
    minimalView = false,
}) {
    const redirect = useNavigate()
    const [mouseOver, setMouseOver] = useState(false)
    
    const usersPartInSubmission = _.concat([submission.user_label], submission.collaborators)

    const [m, formatedTime] = getFormatDateFromTimestamp(submission.created_on)

    const handleStateChange = (state) => {
        setAttributeSelectionDialog(prevValues => {
            return {
                ...prevValues,
                isOpen: true,
                submission,
                attributeFilter: { min_state: state }, // this is an attribute property 
                prevSelectedAttributes: submission.dataset_attributes,
                newSubmissionState : state
            }
        })
    }

    return (

        <ContextMenu
            disabled={!contextMenuEnabled}
            content={<Menu small={true}>
                <MenuItem text={submission.label} onClick={() => copyTextToClipboard(submission.label)} />
                <MenuDivider />
                <MenuItem text="Dataset View" onClick={ () => redirect("/datasets/"+submission.label)}/>
                <MenuDivider />
                {/* <MenuItem text={"Users"}>
                    {usersPartInSubmission.map(userLabe => )}
                </MenuItem> */}
                <MenuItem text="State">
                    <StateSubMenu {...{stateName,states,onStateChange : handleStateChange}} />
                </MenuItem>
                <MenuDivider />
                <MenuItem text="Create">
                    <MenuItem text="Runlist" onClick={() => setRunlistDialog(prevValues => { return { ...prevValues, isOpen: true, submission } })} />
                </MenuItem>
                <MenuItem text="Edit">
                    <MenuItem text="Samples Attributes"
                        onClick={() => { setAttributesDialog(prevValues => { return { ...prevValues, isOpen: true, submission, samplesAttributes: true } }) }} />
                    <MenuItem text="Dataset Attributes"
                        onClick={() => { setAttributesDialog(prevValues => { return { ...prevValues, isOpen: true, submission, samplesAttributes: false } }) }} />
                </MenuItem>
                
        </Menu>}>
        <div
            className="submission__item__container bg--white padding--little"
                style={{ borderLeft: `3px solid ${borderColor}`, position: "relative" }}
                onMouseEnter={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)}>
            <div className="bg--grey margin--little padding--little" style={{width : "100%"}}>
            <div className="flex justify-space-between" > 
            <div className="flex flex--wrap center-items">
                
                {/* {usersPartInSubmission.map(user => <UserIcon />)} */}
                
                <div>{m.fromNow()} ({formatedTime})</div>
                
                <div style={{paddingLeft : "1rem", fontWeight:600}}>{submission.title}</div>
                            
            </div>
            <div className="flex flex--wrap center-items">
                    <div>
                        <AttributeTagWithTooltip {...{
                            attribute: { text: "Replicates", tag: "reps" },
                            attributeValue: { tag: "numb-reps", text: _.uniq(submission.replicates).length }
                        }} />
                    </div>  
                    <div>
                    <AttributeTagWithTooltip {...{
                            attribute: { text: "Number samples", tag: "samples" },
                            attributeValue: { tag: "numb-samps", text: submission.sample_names.length}
                        }} />
                    </div> 
                    <div>
                        <UserIconWithTooltip userLabel={usersPartInSubmission[0]} usersByLabel={usersByLabel} />
                            </div>      
                        {/* <div>
                                {mouseOver ? <Button text="Explore" /> : null}
                        </div>         */}
            </div>
                    </div>
                    {minimalView ? <div>
                        <div>
                        {_.keys(submission.samples_attributes).map(sampleAttrs => {
                            const {name, values } = submission.samples_attributes[sampleAttrs]
                            return (
                                <SampleAttributeTagWithTooltip key={`sampleAttr-${name}`} {...{ name, values, attrValuesByTag : attributeValuesByTag, sampleNames : submission.sample_names }} />
                            )
                        })}
                     </div>
                    <div className="flex flex--wrap intent-margin-top--little">
                        {Object.keys(submission.dataset_attributes).map(attributeTag => {
                            const attrValueTags = submission.dataset_attributes[attributeTag]
                            const attribute = _.has(attributesByTag, attributeTag) ? attributesByTag[attributeTag] : { text: attributeTag }
                            {
                                return <div className="flex"
                                    key={`${attributeTag}-subission-item-${submission.label}`}>
                                    {attrValueTags.map(attrValueTag => {
                                    const attrValueFound = _.has(attributeValuesByTag, attrValueTag)
                                    const attributeValue = attrValueFound ? attributeValuesByTag[attrValueTag] : { text: attrValueTag }
                                    return <div key={`${attributeTag}-${attrValueTag}`} className="intent-margin-right--little intent-margin-top--tiny">
                                        <AttributeTagWithTooltip {...{ attribute, attributeValue }} />
                                    </div>
                                })}</div>
                            }
                        })}
                    </div>   

                        </div> : null}
                <div>
                    {mouseOver ? <button style={{border : "none", backgroundColor : "transparent"}} onClick={() => redirect(`/datasets/${submission.label}`)}><h3 style={{ color: borderColor }}>Dataset Page</h3></button>: null}
                    </div>
                </div> 
                
            </div>
            </ContextMenu>
)
}