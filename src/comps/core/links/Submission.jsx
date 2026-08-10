import _ from "lodash"
import { Link } from "react-router"
import { api } from "@/api"
/**
 * Highlights occurrences of search_string in text. Only works on exact matches.
 * @param {Object} props 
 * @param {String} props.text 
 * @returns 
 */
export function HighlightText({ text, search_string }) {
    const splits = _.split(text, search_string)

    const buildComp = (splits) => {

        if (splits.length === 1) return <span>{text}</span>
        let result = []

        // if (startsWith) result.push(search_string)
        splits.forEach((part, i) => {
            if (part) {
                result.push(<span key={`text-${i}`}>{part}</span>);
            }
            // Don't add highlight after the last split
            if (i < splits.length - 1) {
                result.push(
                <span key={`mark-${i}`} style={{ fontWeight : 800 }}>
                    {search_string}
                </span>
                );
            }
        });
        return result
    }

    return <>{buildComp(splits)}</>
}

/**
 * The submission link component. AAllows to highlight a search string in the title in order to visualize search matches.
 * @param {Object} props 
 * @param {String} props.tag The submission tag
 * @param {String} props.search_string potential search string to highlight in the submission title 
 * @returns 
 */
export function SubmissionLink({ tag, search_string}) {
    
    const { data : submission_title, isSuccess } = api.submissions.title.useGetSubmissionTitle({tag},{enabled : _.isString(tag) && tag.length > 0})

    return <div>
        {isSuccess && _.isString(submission_title) ?
            <Link to={`/submissions/${tag}`}>
            <HighlightText text={submission_title} search_string={search_string} />
        </Link> : null }
            
    </div>
}