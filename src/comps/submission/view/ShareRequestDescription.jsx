import PropTypes from "prop-types"
import _ from "lodash"
import { Link } from "react-router"
import { api } from "@/api"
import { ConsortiumText } from "./ConsortiumText"
import { UserFullName } from "@/comps/core/input/api/UserInput"

ShareRequestDescription.propTypes = {
    submission_tag: PropTypes.string.isRequired,
    consortium_tag: PropTypes.string.isRequired,
    requested_by: PropTypes.string
}

/**
 * @description Human readable description of a pending consortium share request:
 * "<user> has requested to share <submission title> to the consortium <consortium name>".
 * @param {Object} props
 * @param {String} props.submission_tag Tag of the submission to share
 * @param {String} props.consortium_tag Tag of the target consortium
 * @param {String} [props.requested_by] Tag of the user who requested the share
 * @returns {JSX.Element} The share request description sentence.
 */
export function ShareRequestDescription({ submission_tag, consortium_tag, requested_by }) {
    const { data: title, isSuccess } = api.submissions.title.useGetSubmissionTitle(
        { tag: submission_tag }, { enabled: _.isString(submission_tag) && submission_tag.length > 0, staleTime: 200000 }
    )
    return <span className="font-size--small">
        {_.isString(requested_by) ? <><UserFullName tag={requested_by} /> has</> : "Someone has"}
        {" "}requested to share{" "}
        <b>{isSuccess && _.isString(title)
            ? <Link to={`/submissions/${submission_tag}`}>{title}</Link>
            : <Link to={`/submissions/${submission_tag}`}>{submission_tag}</Link>}</b>
        {" "}to the consortium{" "}
        <b><ConsortiumText tag={consortium_tag} /></b>
    </span>
}