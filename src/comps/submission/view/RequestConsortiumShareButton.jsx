import { useState } from "react"
import _ from "lodash"
import { Dialog, DialogBody, DialogFooter, Button } from "@blueprintjs/core"
import TooltipButton from "@/comps/core/base/buttons/TooltipButton"
import { api } from "@/api"
import { ConsortiumShares } from "./ConsortiumShares"

/**
 * @description Button for the submission overview quick access bar that opens a dialog with the
 * consortium sharing panel, where the owner of a submission can request to share it with a
 * consortium. Renders nothing if the user is not a member of any consortium. If the head (PI)
 * of the users research group has not agreed to the consortium share terms of any of the users
 * consortiums, the button is replaced by a disabled indicator that states that consortium
 * sharing is disabled by the PI.
 * @param {Object} props
 * @param {String} props.submission_tag Submission tag
 * @returns {JSX.Element|null} The request consortium share button with dialog.
 */
export function RequestConsortiumShareButton({ submission_tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const { data: userConsortiums, isLoading, isSuccess } = api.consortiums.useGetUserConsortiums(
        {}, { staleTime: 300000, retry: false }
    )
    const { data: pendingTermsConsortiums, isLoading: termsIsLoading } = api.consortiumTerms.useGetUserConsortiumsWithPendingTerms(
        {}, { staleTime: 60000, retry: false }
    )
    if (isLoading || termsIsLoading) return null
    if (!isSuccess || !_.isArray(userConsortiums) || userConsortiums.length === 0) return null
    const pendingTags = _.isArray(pendingTermsConsortiums) ? pendingTermsConsortiums : []
    const shareableConsortiumTags = userConsortiums.filter(tag => !pendingTags.includes(tag))
    if (shareableConsortiumTags.length === 0) {
        return <TooltipButton
            icon="share"
            disabled={true}
            content="Consortium sharing is disabled: the head (PI) of your research group has not agreed to the consortium share terms." />
    }
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