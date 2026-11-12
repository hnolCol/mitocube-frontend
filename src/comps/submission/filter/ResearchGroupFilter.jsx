import _ from "lodash"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { ResearchGroupText } from "@/comps/admin/researchgroup/ResearchGroupText"
import { api } from "@/api"


function ResearchGroupOption({ tag, isSelected, onClick }) {
    return (
        <OptionButton isSelected={isSelected} onClick={onClick}>
            <ResearchGroupText research_group_tag={tag} />
        </OptionButton>
    )
}

/**
 * @description Filter buttons for the research groups of the current user. Toggling a group
 * adds/removes its tag in submissionFilter.research_group_tags, which is sent to the
 * backend submissions query to restrict the submissions to submissions created by
 * members of the selected research groups. Renders nothing if the user is not
 * authenticated or is not a member of any research group.
 * @param {Object} props
 * @param {Object} props.submissionFilter Current submission filter state
 * @param {Function} props.setSubmissionFilter Setter of the submission filter state
 * @param {Object} props.authenticationStatus Authentication status of the current user
 * @returns {JSX.Element|null} The research group filter buttons.
 */
export function ResearchGroupFilter({ submissionFilter, setSubmissionFilter, authenticationStatus }) {
    const user_tag = authenticationStatus?.isAuth ? authenticationStatus?.tag : undefined
    const { data: researchGroupTags = [], isSuccess } = api.researchgroups.useGetResearchGroupsOfUser(
        { user_tag }, { enabled: _.isString(user_tag), staleTime: 300000 }
    )
    const selected = submissionFilter.research_group_tags ?? []

    const toggle = (tag) => {
        setSubmissionFilter(prev => {
            const current = prev.research_group_tags ?? []
            const next = current.includes(tag) ? _.without(current, tag) : [...current, tag]
            if (next.length === 0) {
                const { research_group_tags, ...rest } = prev
                return rest
            }
            return { ...prev, research_group_tags: next }
        })
    }

    if (!isSuccess || researchGroupTags.length === 0) return null

    return researchGroupTags.map(tag => (
        <ResearchGroupOption
            key={tag}
            tag={tag}
            isSelected={selected.includes(tag)}
            onClick={() => toggle(tag)}
        />
    ))
}
