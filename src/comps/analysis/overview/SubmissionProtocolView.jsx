import { api } from "@/api"
import { ProtocolMinimalItem } from "@/comps/admin/protocols/ProtocolMinimalItem"
import { ProtocolView } from "@/comps/admin/protocols/ProtocolView"
import { SubmissionProtocolLink } from "@/comps/admin/protocols/SubmissionProtocolLink"
import { Dialog, DialogBody, Drawer } from "@blueprintjs/core"
import _ from "lodash" 
import { useState } from "react"

export function SubmissionProtocolsView({ submission_tag }) {
    const [dialogProps, setDialogProps] = useState({ isOpen: false, editMode: false, selected_protocol_tags: [] })
    const [drawerProps, setDrawerProps] = useState({ isOpen: false, protocol_tag: null })
    const { data: permissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag({ tag: submission_tag }, { enabled: _.isString(submission_tag) })
    const { data: submission_protocols, refetch : refetchSubmissionProtocols } = api.submissions.protocols.useGetSubmissionProtocols({ tag: submission_tag }, { enabled: _.isString(submission_tag) })
    const { mutate : linkProtocol} = api.protocols.modify.useLinkProtocolToSubmission()
    const { mutate : unlinkProtocol } = api.protocols.modify.useUnlinkProtocolFromSubmission()
    const canEdit = permissions?.edit === true

    const handleOpen = () => {
        // logic to open a dialog for adding a new protocol
        setDialogProps({ ...dialogProps, isOpen: true, selected_protocol_tags: submission_protocols || [] })
    }

    const handleClose = () => {
        setDialogProps({ ...dialogProps, isOpen: false })
    }

    const handleProtocolChange = (protocol_tag) => {

        if (_.isString(protocol_tag) && submission_protocols.includes(protocol_tag)) {
            unlinkProtocol({ submission_tag, protocol_tag }, {
                onSuccess: () => {
                    refetchSubmissionProtocols();
                },
                onError: (error) => {
                    console.error("Error unlinking protocol:", error, error.response.data);
                }
            });
        }
        else {
            linkProtocol({ submission_tag, protocol_tag }, {
                onSuccess: () => {
                    refetchSubmissionProtocols();
                },
                onError: (error) => {
                    console.error("Error linking protocol:", error);
                }
            });
        }
    }

    return (
        <div className="flex flex-column" style={{ overflow: "hidden", width: "100%" }}>
            <Dialog isOpen={dialogProps.isOpen} onClose={handleClose}>
                <DialogBody>
                    <h3>Link Protocol</h3>
                    <SubmissionProtocolLink submission_tag={submission_tag} selected_protocol_tags={submission_protocols} onChange={handleProtocolChange} onDone={handleClose}/>
                </DialogBody>
            </Dialog>

            <Drawer isOpen={drawerProps.isOpen} onClose={() => setDrawerProps({ isOpen: false, protocol_tag: null })} title="View Protocol" canOutsideClickClose={true} canEscapeKeyClose={true}>
                <ProtocolView protocol_tag={drawerProps.protocol_tag} />
                
            </Drawer>

            <div className="flex center-items justify-space-between" >
                    <h3>Utilized Protocols</h3>
                            {canEdit && (
                            <button className="dialog-button" onClick={handleOpen}>+</button>
                            )}
                        </div>
            <div style={{ height: "29vh", padding: "1rem", overflowY: "scroll" }}>
                {submission_protocols?.map((protocol_tag) =>  <ProtocolMinimalItem key={protocol_tag} protocol_tag={protocol_tag} onClick={() => setDrawerProps({ isOpen: true, protocol_tag })} />)}

            </div>
        </div>
    )
}