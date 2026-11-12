import _ from "lodash"
import { OptionButton } from "@/comps/core/base/buttons/OptionButton"
import { api } from "@/api"

const CURATOR_ROLE = 3   // must match UserRolesEnum.CURATOR in the backend

function ConsortiumOption({ tag, isSelected, onClick }) {
    const { data } = api.consortiums.useGetConsortiumByTag({ tag })
    return (
        <OptionButton isSelected={isSelected} onClick={onClick}>
            {data?.text ?? tag}
        </OptionButton>
    )
}

/**
 * @description Filter buttons for consortium submissions. Curators and admins see all
 * consortiums; other users only see the consortiums they are a member of (via their
 * research groups). Toggling a consortium adds/removes its tag in
 * submissionFilter.consortium_tags, which is sent to the backend submissions query.
 * @param {Object} props
 * @param {Object} props.submissionFilter Current submission filter state
 * @param {Function} props.setSubmissionFilter Setter of the submission filter state
 * @param {Object} props.authenticationStatus Authentication status of the current user
 * @returns {JSX.Element|null} The consortium filter buttons.
 */
export function ConsortiumFilter({ submissionFilter, setSubmissionFilter, authenticationStatus }) {
    const isCurator = authenticationStatus?.isAuth && _.toNumber(authenticationStatus?.role) >= CURATOR_ROLE
    const { data: userConsortiumTags = [], isSuccess: isUserConsortiumsSuccess } = api.consortiums.useGetUserConsortiums()
    const { data: allConsortiumTags = [], isSuccess: isAllConsortiumsSuccess } = api.consortiums.useGetAllConsortiums(
        {}, { enabled: isCurator }
    )
    const consortiumTags = isCurator ? allConsortiumTags : userConsortiumTags
    const isSuccess = isCurator ? isAllConsortiumsSuccess : isUserConsortiumsSuccess
    const selected = submissionFilter.consortium_tags ?? []

    const toggle = (tag) => {
        setSubmissionFilter(prev => {
            const current = prev.consortium_tags ?? []
            const next = current.includes(tag) ? _.without(current, tag) : [...current, tag]
            if (next.length === 0) {
                const { consortium_tags, ...rest } = prev
                return rest
            }
            return { ...prev, consortium_tags: next }
        })
    }

    if (!isSuccess || consortiumTags.length === 0) return null

    return consortiumTags.map(tag => (
        <ConsortiumOption
            key={tag}
            tag={tag}
            isSelected={selected.includes(tag)}
            onClick={() => toggle(tag)}
        />
    ))
}