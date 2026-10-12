import { useState } from "react"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button } from "@blueprintjs/core"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"
import { api } from "@/api"
import { ConsortiumShares } from "./ConsortiumShares"

/**
 * @description Button for the submission overview quick access bar that opens a dialog with the
 * consortium sharing panel, where the owner of a submission can request to share it with a
 * consortium. Renders nothing if the user is not a member of any consortium.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element|null} The request consortium share button with dialog.
 */
export function RequestConsortiumShareButton({ submission_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const { data: userConsortiums, isLoading, isSuccess } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    if (isLoading || !isSuccess || !_.isArray(userConsortiums) || userConsortiums.length === 0) return null
    return <>
        <TooltipButton
            icon="share"
            content="Request to share this submission with a consortium"
            onClick={() => setIsOpen(true)} />
        <Dialog
            isOpen={isOpen}
            title="Consortium sharing"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <ConsortiumShares submission_tag={submission_tag} />
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}
