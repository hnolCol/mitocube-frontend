import _ from "lodash"
import { Tag, Tooltip } from "@blueprintjs/core"
import { api } from "@/api"
import { ConsortiumText } from "./ConsortiumText"

/**
 * @description Renders the share status badge of one consortium for a submission. Hovering the
 * badge shows the consortium and its share status. Renders nothing if the submission is neither
 * shared with nor pending for the consortium.
 * @param {Object} props
 * @param {String} props.tag Consortium tag
 * @param {String} props.submission_tag Submission tag
 * @param {Boolean} props.isPending True if a share request for this consortium is pending PI approval
 * @returns {JSX.Element|null} The share status tag with tooltip.
 */
function ConsortiumShareStatusTag({ tag, submission_tag, isPending }) {
    const { data: submission_tags, isSuccess } = api.consortiums.useGetConsortiumSubmissions(
        { tag }, { enabled: _.isString(tag) && _.isString(submission_tag), staleTime: 60000 }
    )
    const isShared = isSuccess && _.isArray(submission_tags) && submission_tags.includes(submission_tag)
    if (!isShared && !isPending) return null
    return <Tooltip
        content={<div className="flex flex-column" style={{ gap: "0.1rem" }}>
            <span><ConsortiumText tag={tag} /></span>
            <span>{isPending ? "Share pending PI approval" : "Submission is shared with this consortium"}</span>
        </div>}
        placement="bottom">
        <Tag
            minimal={true}
            round={true}
            intent={isPending ? "warning" : "success"}
            icon={isPending ? "time" : "endorsed"}>
            {isPending ? "Pending share approval" : "Shared with consortium"}
        </Tag>
    </Tooltip>
}

/**
 * @description Indicates on the submission overview if the submission is shared with a
 * consortium or if a share request is pending approval by a PI. Hovering a badge shows the
 * consortium it refers to. Renders nothing if the submission is neither shared nor pending.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element|null} The consortium share status indicators.
 */
export function ConsortiumShareStatus({ submission_tag }) {
    const { data: consortium_tags, isSuccess } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    const { data: pendingTags } = api.consortiums.useGetPendingConsortiumShares(
        { submission_tag }, { staleTime: 60000 }
    )

    if (!isSuccess || !_.isArray(consortium_tags) || consortium_tags.length === 0) return null

    const pendingConsortiumTags = _.isArray(pendingTags) ? pendingTags : []

    return <div className="flex" style={{ gap: "0.3rem", flexWrap: "wrap", justifyContent: "center" }}>
        {consortium_tags.map(consortium_tag => <ConsortiumShareStatusTag
            key={consortium_tag}
            tag={consortium_tag}
            submission_tag={submission_tag}
            isPending={pendingConsortiumTags.includes(consortium_tag)} />)}
    </div>
}
