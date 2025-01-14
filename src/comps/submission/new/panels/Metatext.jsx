import MetaText from "../MetaText"



export function MetatextTab({ submission, setSubmission, setComponentKey, componentKey }) {

    const onMetaTextChange = (tag, text) => {
        //handles changes in the metatext 
        let metatext = submission.metatext
        metatext[tag] = text
        setSubmission(prevValues => {return {...prevValues,metatext}})
        
    }
    

    return  <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
    <h3>Meta Text</h3>

    <MetaText metatextValues={submission.metatext} {...{ onMetaTextChange }} />

</div>
}