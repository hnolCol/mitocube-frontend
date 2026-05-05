
import { api } from "@/api"
import { SubmissionTitle } from "@/comps/submission/view/SubmissionTitle"
import PropTypes from "prop-types" 
import _ from "lodash" 
import { BaseInput } from "./BaseInput"

SubmissionInput.propTypes = {
    selected_submission_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired
}
export function SubmissionInput({ selected_submission_tags = [], onSelect }) {


    return <BaseInput
        selected_tags={selected_submission_tags}
        render_children={(submission_tag) => <SubmissionTitle tag={submission_tag} showCopyToClipboard={true} showEdit={false} />}
        api_hook={api.submissions.query.useGetSubmissionByQuery}
        onSelect={onSelect}
        api_hook_params={{group_by_state : false}}
        placeholder="Select" />

}