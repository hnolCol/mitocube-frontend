import { ContextMenu, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { TraitWithValueInput, SampleAttributeTagWithTooltip } from "../../core/base/tags/TagWithTooltip";
import { UserIconWithTooltip } from "../../core/base/user";
import { isHexColorLight } from "../../../services/colors";
import { titleFormat } from "../../../services/format/string";
import { copyTextToClipboard } from "../../../services/clipboard";
import { useNavigate } from "react-router";
import { AttributeFeatureTag } from "../new/attribute/view/DatasetAttributesHierarchy";
import { TitleText } from "../../core/metrics/ItemBasics";
import { CraetedAt } from "../../core/metrics/CreatedAt";
import { SampleAttributesView } from "../../core/base/attributes/SampleAttributesView";


import _ from "lodash"



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
    setAttributeSelectionDialog,
    usersByLabel,
    setAttributesDialog,
    setRunlistDialog,
    contextMenuEnabled = true,
    minimalView = false,
    setChangeOwnerDialog,
    setMetatextDialog
}) {
    const redirect = useNavigate()    
    const usersPartInSubmission = _.concat([submission.user_label], submission.collaborators)

    const handleStateChange = (state) => {
        setAttributeSelectionDialog(prevValues => {
            return {
                ...prevValues,
                isOpen: true,
                submission_tag : submission.tag,
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
                <MenuItem text={submission.tag} onClick={() => copyTextToClipboard(submission.tag)} />
                <MenuDivider />
                <MenuItem text="Dataset View" onClick={ () => redirect("/datasets/"+submission.tag)}/>
                <MenuDivider />
                <MenuItem text="State">
                    <StateSubMenu {...{stateName, states, onStateChange : handleStateChange}} />
                </MenuItem>
                <MenuDivider />
                <MenuItem text="Create">
                    <MenuItem text="Runlist" onClick={() => setRunlistDialog(prevValues => { return { ...prevValues, isOpen: true, submission } })} />
                </MenuItem>
                <MenuItem text="Edit">
                    <MenuItem text="Samples Attributes"
                        onClick={() => setAttributesDialog(prevValues => { return { ...prevValues, isOpen: true, submission, samplesAttributes: true } }) } />
                    <MenuItem text="Dataset Attributes"
                        onClick={() => setAttributesDialog(prevValues => { return { ...prevValues, isOpen: true, submission, samplesAttributes: false } })} />
                    <MenuDivider />
                    <MenuItem text="Metatext"
                        onClick={() => setMetatextDialog(prevValues => { return { ...prevValues, isOpen: true, submission, samplesAttributes: false } }) } />
                    <MenuDivider />

                    <MenuItem text="Owner" onClick={() => setChangeOwnerDialog(prevValues => {return {...prevValues,isOpen :true, submission}})}>
                        
                    </MenuItem>
                </MenuItem>
                
        </Menu>}>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    redirect(`/datasets/${submission.tag}`)
                }}
            className="submission__item__container bg--white"
                style={{border: "none", color : "#000", padding : "0px"}}>
            <div style={{borderLeft : `3px solid ${borderColor}`}} className="padding--little">
            <div className="bg--grey margin--little padding--little">
            <div className="flex justify-space-between" > 
            <div className="flex flex--wrap center-items">
                <CraetedAt createdat={submission.created_at}/>                
                <TitleText title={submission.title} />
                            
            </div>
            <div className="flex flex--wrap center-items">
                    <div>
                        <TraitWithValueInput {...{
                            attribute: { text: "Replicates", tag: "reps" },
                            attributeValue: { tag: "numb-reps", text: submission.n_replicates}
                        }} />
                    </div>  
                    <div>
                    <TraitWithValueInput {...{
                            attribute: { text: "Number samples", tag: "samples" },
                            attributeValue: { tag: "numb-samps", text: submission.n_samples}
                        }} />
                    </div> 
                    <div>
                        <UserIconWithTooltip userLabel={usersPartInSubmission[0]} usersByLabel={usersByLabel} />
                    </div>      

            </div>
                        </div>
                        <SampleAttributesView  submission_tag={submission.tag}/>
                    {minimalView ? <div>
                            <div>
                            {/* <SampleAttributeTagWithTooltip /> */}
                        {/* {_.keys(submission.samples_attributes).map(sampleAttrs => {
                            const {name, values } = submission.samples_attributes[sampleAttrs]
                            return (
                                <SampleAttributeTagWithTooltip key={`sampleAttr-${name}`} {...{ name, values, attrValuesByTag : attributeValuesByTag, sampleNames : submission.sample_names }} />
                            )
                        })} */}
                     </div>
                    <div className="flex flex--wrap intent-margin-top--little">
                        {Object.keys(submission.dataset_attributes).map(attributeTag => {
                            const attributeValues = submission.dataset_attributes[attributeTag]
                            const attribute = submission.attributes[attributeTag]
                            {
                                return <div className="flex"
                                    key={`${attributeTag}-subission-item-${submission.label}`}>
                                    {attributeValues.map(attributeValue => {
                                    return <div key={`${attributeTag}-${attributeValue.tag}`} className="intent-margin-right--little intent-margin-top--tiny">
                                        <AttributeFeatureTag {...{attribute,value : attributeValue, valueIsFeature : attribute.has_features_value}} />
                                        {/* <TraitWithValueInput {...{ attribute, attributeValue }} /> */}
                                    </div>
                                })}</div>
                            }
                        })}
                    </div>   

                        </div> : null}
                </div> 
                </div>
            </button>
            </ContextMenu>
)
}