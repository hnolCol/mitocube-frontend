import _ from "lodash"
import { api } from "@/api"
import { ConditionApplicationsView } from "../../base/condition_applications/ConditionApplicationView"
import PropTypes from "prop-types"
import { BaseInput } from "./BaseInput"



ConditionApplicationInput.propTypes = {
    selected_ca_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired,
    submission_tag: PropTypes.string,
    attribute_tag: PropTypes.string,
    samples_only: PropTypes.bool
}
export function ConditionApplicationInput({ selected_ca_tags = [], onSelect, submission_tag, attribute_tag, samples_only = true }) {
    return <BaseInput
        selected_tags={selected_ca_tags}
        render_children={(ca_tag) => <ConditionApplicationsView tag={ca_tag} />}
        api_hook={api.condition_applications.useGetConditionApplicationByQuery}
        onSelect={onSelect}
        api_hook_params={{submission_tag, attribute_tag, samples_only, limit : 30}}
        placeholder="Select" />


}
