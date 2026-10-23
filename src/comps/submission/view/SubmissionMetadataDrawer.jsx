import _ from "lodash"
import { Drawer } from "@blueprintjs/core"
import { SubmissionTitle } from "./SubmissionTitle"
import { SubmissionDate } from "./SubmissionDate"
import { SubmissionSampleCount } from "./SubmissionSampleCount"
import { SubmissionProteinGroupCount } from "./SubmissionProteinGroupCount"
import { SubmissionPrecursorCount } from "./SubmissionPrecursorCount"
import { SubmissionConditionApplicationView } from "../../analysis/overview/SubmissionConditionApplicationView"
import { SubmissionProtocolsView } from "../../analysis/overview/SubmissionProtocolView"
import { AuthorList } from "../../core/authors/AuthorList"
import { Metatexts } from "../../core/metatext/SubmissionMetatext"
import { Button } from "@blueprintjs/core"
import { useNavigate } from "react-router"

export function SubmissionMetadataDrawer({ isOpen, submission_tag, onClose }) {
    const redirect = useNavigate()

    return <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Submission Metadata"
        canOutsideClickClose={true}
        canEscapeKeyClose={true}
        size="60vw"
    >
        {_.isString(submission_tag) ? <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", height: "100%" }}>
            <div>
                <SubmissionTitle tag={submission_tag} showEdit={false} showCopyToClipboard={true} />
                <div className="flex flex--wrap" style={{ gap: "0.5rem" }}>
                    <AuthorList submission_tag={submission_tag} />
                    <Button intent="primary" variant="minimal" icon="share" text="Explore submission" onClick={() => redirect(`/submissions/${submission_tag}`)} />
                </div>
                <SubmissionDate submission_tag={submission_tag} />
            </div>
            <div className="flex flex--wrap" style={{ gap: "0.5rem" }}>
                <SubmissionSampleCount submission_tag={submission_tag} />
                <SubmissionProteinGroupCount submission_tag={submission_tag} />
                <SubmissionPrecursorCount submission_tag={submission_tag} />
            </div>
            <div className="bg--lightgrey padding--little">
                <SubmissionConditionApplicationView submission_tag={submission_tag} />
            </div>
            <div className="bg--lightgrey padding--little">
                <SubmissionProtocolsView submission_tag={submission_tag} />
            </div>
            <div>
                <Metatexts submission_tag={submission_tag} fill={false} />
            </div>
        </div> : null}
    </Drawer>
}
