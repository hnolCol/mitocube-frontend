import { getRandomID } from "../../../../services/random"
import { MetaTextInput } from "../../../core/dialogs/MetaTextInput"
import MetaText from "../MetaText"


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
    
    return  <div>
        <h3>Meta Text</h3>
        <MetaText metatextValues={submission.metatext} {...{ onMetaTextChange }} />
        <div>
            <button onClick={addExtraMetaText}>+</button>
            {submission.extraMetaText.length}
            {submission.extraMetaText.length > 0 ? submission.extraMetaText.map((meta, index) => {
                console.log(meta)
                return <div key={meta.tag} style={{ height: "250px" }}><MetaTextInput metatext={meta} setMetatext={(type, text) => handleMetaTextChange(meta.tag, type, text)} showButton={false} setIsStateFunction={false} /></div>
             } ) : null}

        </div>
</div>
}