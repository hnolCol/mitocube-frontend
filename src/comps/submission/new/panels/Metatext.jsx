import { AddButton } from "@/comps/core/base/buttons/AddButton"
import { getRandomID } from "../../../../services/random"
import { MetaTextInput } from "../../../core/dialogs/MetaTextInput"
import MetaText from "../MetaText"
import _ from "lodash"
import { HIGHLIGHT_COLOR } from "@/comps/core/colors/colorPalette"

/**
 * Displays the metatext tab in the new submission panel and allows editing metatexts.
 * @param {Object} props 
 * @param {Object} props.submission The submission object (coming from useState in parent component)
 * @param {Function} props.setSubmission The function to set the submission object (from useState in parent component)
 * @param {Function} props.setComponentKey Function to set the component key (change panel, force rerender)
 * @param {String} props.componentKey 
 * @returns 
 */
export function MetatextTab({ submission, setSubmission, setComponentKey, componentKey }) {

    const addExtraMetaText = () => {
        let extraMetaText = submission.extraMetaText || []
        extraMetaText.push({ title: "", text: "",  tag : getRandomID(5)})
        setSubmission(prevValues => {return {...prevValues, extraMetaText}})
    }

    const onMetaTextChange = (tag, text) => {
        //handles changes in the metatext 
        let metatext = submission.metatext
        metatext[tag] = text
        setSubmission(prevValues => {return {...prevValues,metatext}})  
    }

    const handleMetaTextChange = (tag, type, text) => { 
        let updatedExtraMetaText = submission.extraMetaText.map(meta => {
            if (meta.tag === tag) {
                meta[type] = text
            }
            return meta
        })

        setSubmission(prevValues => {return {...prevValues, extraMetaText : updatedExtraMetaText}})
    }
    
    const onMetaTextRemove = (tag) => {
        let updatedExtraMetaText = submission.extraMetaText.filter(meta => meta.tag !== tag)
        setSubmission(prevValues => {return {...prevValues, extraMetaText : updatedExtraMetaText}})
    }

    return  <div>
        <h3>Meta Text</h3>
        <div className="flex center-items margin--little" >
            <button className="basic-button" onClick={addExtraMetaText}>
            <span style={{ color: HIGHLIGHT_COLOR }}><strong>Add Meta Text</strong></span>
            </button>
        </div>
        <MetaText metatextValues={submission.metatext} {...{ onMetaTextChange }} />
        <div>
            
            {submission.extraMetaText.length > 0 ? submission.extraMetaText.map((meta, index) => {
                return <div key={meta.tag} style={{ height: "250px" }}><MetaTextInput metatext={meta} setMetatext={(type, text) => handleMetaTextChange(meta.tag, type, text)} showButton={false} setIsStateFunction={false} showRemove={true} onRemove={() => onMetaTextRemove(meta.tag)} /></div>
             } ) : null}

        </div>
</div>
}