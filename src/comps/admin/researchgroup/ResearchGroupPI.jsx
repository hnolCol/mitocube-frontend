import _ from "lodash"
import { api } from "@/api"
import { getUserFullName } from "@/services/format/user"

/**
 * @description Displays the name of a user by its tag.
 * @param {Object} props
 * @param {String} props.tag User tag
 * @returns {JSX.Element} The user name.
 */
function UserName({ tag }) {
    const { data: user, isSuccess } = api.users.core.useGetPublicUserByTag({ tag }, { enabled: _.isString(tag) })
    return <span>{isSuccess && _.isObject(user) ? getUserFullName(user) : tag}</span>
}

/**
 * @description Displays the PIs (heads) of a research group in the admin overview. Shows an
 * indication to add a PI if the research group has none.
 * @param {Object} props
 * @param {String} props.tag Research group tag
 * @param {Function} props.onAddPI Callback to open the edit dialog to add a PI
 * @returns {JSX.Element} The PI display or add PI indication.
 */
export function ResearchGroupPI({ tag, onAddPI }) {
    const { data: head_tags, isSuccess, isLoading } = api.researchgroups.useGetResearchGroupHeads({ tag }, { enabled: _.isString(tag) })

    if (isLoading) return <span>PI : ...</span>

    if (!isSuccess) return null

    return <div className="flex" style={{ gap: "0.2rem" }}>
        {_.isArray(head_tags) && head_tags.length > 0 ?
            <span>
                PI : {head_tags.map((head_tag, idx) => <span key={head_tag}>
                    {idx > 0 ? ", " : ""}
                    <UserName tag={head_tag} />
                </span>)}
            </span> :
            <span
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={(e) => {
                    e.stopPropagation()
                    if (_.isFunction(onAddPI)) onAddPI()
                }}>
                PI : none defined - click to add PI
            </span>}
    </div>
}
