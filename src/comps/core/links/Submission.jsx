import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { Link } from "react-router-dom"
/**
 * 
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


export function SubmissionLink({ tag, search_string}) {
    
    const { data : submission_title, isLoading, isFetching } = hooks.submissions.useGetSubmissionTitle({tag},{enabled : _.isString(tag) && tag.length > 0})

    return <div>
        <Link to={`/submissions/${tag}`}>
            <HighlightText text={submission_title} search_string={search_string}/>
        </Link>
            
    </div>
}