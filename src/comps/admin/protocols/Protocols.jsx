import { Dialog, DialogBody, Drawer } from "@blueprintjs/core";
import { InsertProtocol } from "./InsertProtocol";
import { useState } from "react";
import { AddButton } from "@/comps/core/base/buttons/AddButton";
import { api } from "@/api";
import { ProtocolsContainer } from "./ProtocolContainer";
import { ProtocolView } from "./ProtocolView";
import { EditProtocol } from "./EditProtocol";

export function AdminProtocols() {

    const [searchString, setSearchString] = useState("")
    const [triggerUpdate, setTriggerUpdate] = useState(undefined)
    const [dialogProps, setDialogProps] = useState({ isOpen: false, editMode: false, protocol_tag: null })
    const [drawerProps, setDrawerProps] = useState({ isOpen: false, protocol_tag: null })
    const { mutate: postProtocol, isPending } = api.protocols.modify.usePostProtocol()


    const handleInsertProtocol = (protocol) => {

        console.log("Inserting protocol:", protocol);
        postProtocol(protocol, {
            onSuccess: () => {
                console.log("Protocol inserted successfully");
                setDialogProps({ isOpen: false });
                setTriggerUpdate(Math.random()); // Trigger an update to refresh the protocol list
            },
            onError: (error) => {
                console.error("Error inserting protocol:", error);
            }
        }); 
        
        // postProtocol(protocol);
    }
    

    return         <div style={{
                width: "90vw",
                height : "85vh",
                margin: "40px auto",
                padding: 32,
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
            }}>
    
         <Dialog style={{width : "min(950px,70vw)"}} isOpen={dialogProps.isOpen} onClose={() => setDialogProps({ isOpen: false })} title="Add Attribute" canOutsideClickClose={false} canEscapeKeyClose={true}> 
            <DialogBody>
                {dialogProps.isOpen && !dialogProps.editMode ? <InsertProtocol isPending={isPending} onSubmit={handleInsertProtocol} onCancel={() => { setDialogProps({ isOpen: false }) }} /> : 
            dialogProps.editMode && dialogProps.protocol_tag && dialogProps.isOpen ? <EditProtocol onUpdateSuccess={() => setTriggerUpdate(Math.random())} protocol_tag={dialogProps.protocol_tag} onClose={() => { setDialogProps({ isOpen: false, editMode : false, protocol_tag : null  }) }} /> : null}
            </DialogBody>   
        </Dialog>

        <Drawer
            isOpen={drawerProps.isOpen}
            onClose={() => setDrawerProps({ isOpen: false, protocol_tag: null })}
            title="View Protocol"
            canOutsideClickClose={true} canEscapeKeyClose={true}>
            
            <ProtocolView
                protocol_tag={drawerProps.protocol_tag}
                handleEdit={() => {
                    setDialogProps({
                        isOpen: true,
                        editMode: true,
                        protocol_tag: drawerProps.protocol_tag
                    })
                }}
                updateTrigger={triggerUpdate} />
            

        </Drawer>
    
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24, letterSpacing: -1 }}>Protocols</h2>
        
        <div className="flex center-items" style={{ marginBottom: "1rem", gap: "1rem" }}>
            <AddButton onSelect={() => setDialogProps({ isOpen: true, editMode: false })} /><div>Insert Protocol</div>
        </div>
            
        <input
            className="search-input"
            type="text"
            placeholder="Search protocols ..."
            value={searchString || ""}
            onChange={(e) => setSearchString(e.target.value)}
        />

        <ProtocolsContainer search_string={searchString} limit={50} onClick={(protocol_tag) => setDrawerProps({ isOpen: true, protocol_tag })} trigger_update={triggerUpdate} />
    </div>
}