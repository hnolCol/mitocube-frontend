import { Button } from "@blueprintjs/core";
import { AddResearchGroupDialog } from "./AddGroup";
import { useState } from "react";
import { ResearchGroupView } from "./View";
import { EditResearchGroupUsersDialog } from "./EditGroupUsers";


/**
 * @description Displays the research groups and allows to modify them. 
 * @returns 
 */
export function AdminResearchGroup({ }) {
    const [refetchTrigger, setRefetchTrigger] = useState(undefined)
    const [isAddDialogOpen, setIsOpen] = useState(false)
    const [editUsersDialog, setEditUsersDialog] = useState({ isOpen: false, tag: undefined, title: undefined })
    
    const handleAddDialogClose = () => {
        setIsOpen(false)
        setRefetchTrigger(Math.random())
    }

    return <div>
        <AddResearchGroupDialog
            isOpen={isAddDialogOpen}
            onClose={handleAddDialogClose} />
        <EditResearchGroupUsersDialog
            isOpen={editUsersDialog.isOpen}
            tag={editUsersDialog.tag}
            title={editUsersDialog.title}
            onClose={() => setEditUsersDialog({ isOpen: false, tag: undefined, title : undefined })} />

        <h2>Research Groups</h2>

        <Button
            minimal={true}
            onClick={() => setIsOpen(prevValue => !prevValue)}
            icon={"plus"} />
        
        <ResearchGroupView refetchTrigger={refetchTrigger} setEditUsersDialog={setEditUsersDialog} />
    </div>
}