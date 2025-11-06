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

    const onMetaTextChange = (tag, text) => {
        //handles changes in the metatext 
        let metatext = submission.metatext
        metatext[tag] = text
        setSubmission(prevValues => {return {...prevValues,metatext}})  
    }
    
    return  <div>
        <h3>Meta Text</h3>
        <MetaText metatextValues={submission.metatext} {...{ onMetaTextChange }} />

</div>
}