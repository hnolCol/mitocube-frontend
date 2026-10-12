import { Dialog, DialogBody } from "@blueprintjs/core";
import _ from "lodash";
import { useState } from "react";
import { api } from "@/api";
import { SubmissionLink } from "@/comps/core/links/Submission";

/**
 * @description Dialog listing the submissions shared with a consortium.
 * @param {Object} props
 * @param {Boolean} props.isOpen
 * @param {String} props.tag Consortium tag
 * @param {String} props.title Dialog title
 * @param {Function} props.onClose
 * @returns {JSX.Element} The consortium submissions dialog.
 */
export function ConsortiumSubmissionsDialog({ isOpen, tag, title, onClose }) {
    const { data: submission_tags, isLoading, isSuccess } = api.consortiums.useGetConsortiumSubmissions({ tag }, { enabled: _.isString(tag) && isOpen })
    return <Dialog isOpen={isOpen} canEscapeKeyClose title={title} onClose={onClose}>
        <DialogBody>
            {isLoading ? "Loading submissions..." :
                isSuccess && _.isArray(submission_tags) && submission_tags.length > 0 ?
                    <div className="flex flex-column" style={{ gap: "0.3rem" }}>
                        {submission_tags.map(submission_tag => <SubmissionLink key={submission_tag} tag={submission_tag} />)}
                    </div> :
                    <span>No submissions shared with this consortium yet.</span>}
        </DialogBody>
    </Dialog>
}

/**
 * @description Displays the number of submissions shared with a consortium and opens the
 * list of submissions on demand.
 * @param {Object} props
 * @param {String} props.tag Consortium tag
 * @param {Function} props.onShowSubmissions Callback to open the submissions dialog
 * @returns {JSX.Element} The submission count metric.
 */
export function ConsortiumSubmissionsCount({ tag, onShowSubmissions }) {
    const { data: submission_tags, isSuccess } = api.consortiums.useGetConsortiumSubmissions({ tag }, { enabled: _.isString(tag) })
    const [showButton] = useState(true)
    return <div onClick={(e) => { e.stopPropagation(); if (_.isFunction(onShowSubmissions) && isSuccess && _.isArray(submission_tags) && submission_tags.length > 0) onShowSubmissions() }}>
        <span style={{ cursor: isSuccess && _.isArray(submission_tags) && submission_tags.length > 0 ? "pointer" : "default" }}>
            Submissions : {isSuccess && _.isArray(submission_tags) ? submission_tags.length : "..."}{showButton && isSuccess && _.isArray(submission_tags) && submission_tags.length > 0 ? " (click to view)" : ""}
        </span>
    </div>
}
