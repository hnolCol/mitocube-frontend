import { useParams } from "react-router"
import _ from "lodash"
import { api } from "@/api"
import Loading from "@/comps/core/base/loading"

/**
 * @description Links tab of the submission analysis pages. Shows the external links
 * that were provided when the submission was created (e.g. electronic labbook, publication).
 * @returns {JSX.Element} The list of external links of the submission.
 */
export function SubmissionLinksPage() {
    const { tag } = useParams()
    const { data: links, isLoading, isError } = api.submissions.links.useGetSubmissionLinks(
        { tag },
        { enabled: _.isString(tag) && tag.length > 0, staleTime: 60000 }
    )
    return <div className="padding--medium">
        <h3>Links</h3>
        <p>External links provided with this submission, for example links to the electronic labbook or to a relevant publication.</p>
        {isLoading ? <Loading /> : null}
        {isError ? <p>Links could not be loaded.</p> : null}
        {_.isArray(links) && links.length > 0 ?
            <ul>
                {links.map(link => <li key={link.id}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
                    {_.isString(link.comment) && link.comment.length > 0 ? <span> &mdash; {link.comment}</span> : null}
                </li>)}
            </ul>
            : (!isLoading && !isError ? <p>No links defined for this submission.</p> : null)}
    </div>
}
