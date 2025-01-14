import { getRandomID } from "../../../../services/random"
import DatasetLinks from "../Links"
import _ from "lodash"

export function LinksTab({ submission, setSubmission, setComponentKey, componentKey }) {

    const addLink = () => {
        // add a new link
        const linkID = getRandomID(5)
        setSubmission(prevValues => {return {...prevValues,links : _.concat(submission.links, [{link : "", comment : "", id : linkID }])}})
    }

    const removeLinkByIndex = (linkIdx) => {
        //remove a link by index
        setSubmission(prevValues => {return {...prevValues,"links" : prevValues.links.filter((d,idx) => idx !== linkIdx)}})
    }

    const handleLinkChange = (linkIdx, updatedLinkProps) => {
        let links = submission.links 
        links[linkIdx] = updatedLinkProps
        setSubmission(prevValues => {return {...prevValues,links}})
    }

    return  <div className="bg--lightgrey padding--medium div--round intent-margin-top--little">
    <h3>Links</h3>

    <DatasetLinks index={4} links={submission.links} addLink={addLink} removeLink={removeLinkByIndex} onChange={handleLinkChange} />

</div>
}