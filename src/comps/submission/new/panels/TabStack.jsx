import { ScopePanel } from "./Scope";
import React, { useState } from "react";
import "normalize.css"
import { CollaboratorsTab } from "./Collaborators";
import { AttributesTab } from "./Attributes";
import _ from "lodash"
import { MetatextTab } from "./Metatext";
import { AnimatePresence, motion } from "framer-motion";
import { LinksTab } from "./Links";
import { SamplesTab } from "./Samples";
import { Button, Code } from "@blueprintjs/core";
import { TabNavigation } from "./TabNavigation";
import { api } from "@/api";
import { EditableText } from "@/comps/core/input/EditableTextInput";

const componentMap = {
    "scope": ScopePanel,
    "collaborators": CollaboratorsTab,
    "mandatoryAttributes": AttributesTab,
    "metatext": MetatextTab,
    "links": LinksTab,
    "samples" : SamplesTab,
}

const componentNames = {
    "scope": "Scope",
    "collaborators": "Team",
    "mandatoryAttributes": "Attributes",
    "metatext": "Metatext",
    "links": "Links",
    "samples" : "Samples"
}

const XOFFSET = 50


export function TabNextButton({ componentKey, setComponentKey }) {
    
    const componentKeys = _.keys(componentMap) 

    const getNextComponentKey = (componentKey) => {

        const idx = _.indexOf(componentKeys, componentKey.current)
        
        if (idx !== -1 && idx < componentKeys.length - 1) {
            return componentKeys[idx+1]
        }
        
        return -1 
    }

    const nextComponentKey = getNextComponentKey(componentKey)
    
    if (nextComponentKey !== -1) {
        return <button
            onClick={() => setComponentKey(prevValues => {
                return {
                    current: nextComponentKey,
                    prev: prevValues.current
                }
            })}>
            Next
        </button>
    }    
}

const stackVariants = {
    
    enter: (direction) => ({
        x: direction > 0 ? XOFFSET : -XOFFSET, // slide in from the side
        // transition: { duration: 0.5 }
    }),

    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 1,
        transition: { duration: 0.5 },
    },
    exit: (direction) => {
        return {
            x: direction < 0 ? -XOFFSET : XOFFSET, // slide out to the side
            opacity: 0,
            scale: 1.0,
            zIndex: 0,
            transition: { duration: 0.3 },
        }
    }
}

function SelectedComponent({ componentKey, submission, setSubmission, setComponentKey }) {
    
    const SelectedComponent = componentMap[componentKey.current];
    // Fallback for invalid keys
    if (!SelectedComponent) {
        return <div>Component not found</div>;
    }
    return <div style={{ minHeight: "calc(80vh - 150px - 1rem)"}} className="div--expand bg--grey div--round"><SelectedComponent {...{setComponentKey, submission, setSubmission}} /></div>;
}

export function SubmissionPanelStack({
        submission,
        setSubmission,
        onSubmissionRequest,
        saveSubmission,
        resetSubmission
        }) {
    
    const { data: submissionPermission, isSuccess } = api.submissions.permissions.useGetSubmissionPermissions()
    // Initial panel for the stack
    const [componentKey, setComponentKey] = useState({ current: "scope", prev: undefined });
    const componentKeys = _.keys(componentMap) 


    const handleSubmissionTagEdit = (newSubmissionTag) => { 

        setSubmission(prevValues => {
            return {
                ...prevValues,
                tag: newSubmissionTag
            }
        })
    }


    return <div className="div--expand">
        <div className="navbar__submission__grid__container bg--grey">

            <div className="navbar__submission__grid__left" style={{ zIndex: 5 }}>
                <div>{_.isString(submission.tag) ? <h3>{isSuccess && submissionPermission.edit && submissionPermission.create ?
                    <div className="flex flex-column" >
                        <EditableText initialValue={submission.tag} onChange={handleSubmissionTagEdit} minLength={10} maxLength={12} />
                        <div><span style={{ wordWrap: "break-word" }}>{submission.title}</span></div></div> : `${submission.tag}: ${submission.title}`}</h3> : null}</div>
                <TabNavigation {...{
                    componentKey,
                    setComponentKey,
                    componentNames,
                    submission,
                    componentKeys
                }} />

        </div>
            <div className="position--relative navbar__submission__grid__right" style={{ zIndex: 2 }}>
                
            <AnimatePresence>
                <motion.div
                    custom={_.isString(componentKey.prev) ? _.indexOf(componentKeys, componentKey.current) - _.indexOf(componentKeys, componentKey.prev) : 0}
                    className="bg--grey div--round"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        padding: "2rem",
                        marginTop: "0.5rem",
                        height: "98%",
                        overflow: "scroll",
                        
                    }}
                    key={componentKey.current}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={stackVariants}> 
                            <SelectedComponent {...{ componentKey, submission, setSubmission, setComponentKey }} />
                            
                </motion.div>
            </AnimatePresence>
            
        </div>
            <div className="navbar__submission__grid__bottom">
                <div>
                    <Button text="Submit" onClick={onSubmissionRequest} intent="primary" />
                    <Button text="Save" onClick={saveSubmission} />
                    <Button text="Reset Form" onClick={resetSubmission} />
                </div>
            
        </div>
    </div>
    </div>
}

