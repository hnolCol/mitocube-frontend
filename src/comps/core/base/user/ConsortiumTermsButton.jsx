import { useState } from "react"
import _ from "lodash"
import { Button, Callout, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/api"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"
import { ResearchGroupTitle } from "@/comps/core/input/api/ResearchGroupInput"

/**
 * @description One pending consortium terms agreement row: the consortium and the research
 * group the current user leads (as head/PI), with a button to agree to the consortium terms.
 * @param {Object} props
 * @param {Object} props.pending The pending terms agreement ({ consortium_tag, group_tag })
 * @param {Function} props.onInvalidate Callback to invalidate the terms queries
 * @returns {JSX.Element} The pending terms agreement row.
 */
function PendingTermsRow({ pending, onInvalidate }) {
    const { mutate: agree, isPending } = api.consortiumTerms.useAgreeConsortiumTerms({ onSuccess: onInvalidate })
    return <div className="flex justify-between align-center margin--little padding--little bg--lightgrey div--round">
        <div className="flex align-center" style={{ gap: "0.5rem" }}>
            <ConsortiumText tag={pending.consortium_tag} />
            <span className="font-size--smallest">for</span>
            <ResearchGroupTitle tag={pending.group_tag} />
        </div>
        <Button
            small={true}
            intent="primary"
            text="Agree to terms"
            disabled={isPending}
            onClick={() => agree({ consortium_tag: pending.consortium_tag, group_tag: pending.group_tag })} />
    </div>
}

/**
 * @description Warning for members of consortiums where the head (PI) of none of their research
 * groups agreed to the consortium terms yet. Until the agreement they can neither share
 * submissions with these consortiums nor see their shared submissions.
 * @returns {JSX.Element|null} The terms warning callout, or null if all agreed.
 */
export function ConsortiumTermsWarning() {
    const { data: pendingTermsConsortiums, isLoading, isSuccess } = api.consortiumTerms.useGetUserConsortiumsWithPendingTerms(
        {}, { staleTime: 60000, retry: false }
    )
    if (isLoading || !isSuccess || !_.isArray(pendingTermsConsortiums) || pendingTermsConsortiums.length === 0) return null
    return <Callout intent="warning" title="Consortium terms not agreed yet">
        <div className="font-size--small">
            The head (PI) of your research group has not yet agreed to the terms of the following
            consortiums: {pendingTermsConsortiums.map((tag, idx) => (
                <span key={tag}>
                    {idx > 0 ? ", " : ""}<ConsortiumText tag={tag} />
                </span>
            ))}. Until your PI agrees, you can neither share submissions with these consortiums
            nor see their shared submissions.
        </div>
    </Callout>
}

/**
 * @description Button for the topbar that opens a dialog where heads (PIs) agree to the
 * consortium terms for their research groups. Without the agreement the users of the group
 * can neither share into nor see the submissions of the consortium. Renders nothing if
 * there is nothing to agree to.
 * @returns {JSX.Element|null} The consortium terms button with dialog.
 */
export function ConsortiumTermsButton() {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { data: pendingTerms, isLoading } = api.consortiumTerms.useGetPendingConsortiumTerms(
        {}, { staleTime: 60000, retry: false }
    )

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["getPendingConsortiumTerms"] })
        queryClient.invalidateQueries({ queryKey: ["getUserConsortiumsWithPendingTerms"] })
    }

    if (isLoading) return null
    if (!_.isArray(pendingTerms) || pendingTerms.length === 0) return null

    return <>
        <div className="flex flex-column justify-center margin--little">
            <Button
                minimal={true}
                small={true}
                intent="warning"
                icon="endorsed"
                text="Consortium terms"
                onClick={() => setIsOpen(true)} />
        </div>
        <Dialog
            isOpen={isOpen}
            title="Consortium terms"
            onClose={() => setIsOpen(false)}
            style={{ width: "50vw" }}>
            <DialogBody>
                <p className="font-size--small">
                    Your research group is eligible for the following consortiums. Agree to the
                    consortium terms to let the members of your group share submissions with the
                    consortium and see its shared submissions. Without your agreement they can
                    neither share nor see.
                </p>
                {pendingTerms.map((pending, idx) => <PendingTermsRow
                    key={`${pending.consortium_tag}-${pending.group_tag}-${idx}`}
                    pending={pending}
                    onInvalidate={invalidate} />)}
            </DialogBody>
            <DialogFooter actions={<Button text="Close" onClick={() => setIsOpen(false)} />} />
        </Dialog>
    </>
}
