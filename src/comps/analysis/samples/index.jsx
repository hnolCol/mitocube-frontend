import hooks from "@mitocube/api-hooks";
import { useOutletContext } from "react-router";
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import { SamplesContainer } from "./SampleContainer";
import { EditSubmissionSamplesDialog } from "./EditSampleDialog";
import _ from "lodash";
import { api } from "@/api";


export function SubmissionSamples() {
    const { submission_tag } = useOutletContext();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(undefined);

    const { data: permissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    );

    const canEdit = permissions?.edit === true;

    const handleClose = (e, updated = false) => {
        setIsEditOpen(false);
        console.log(updated, "updated");
        if (updated) {
            setUpdateTrigger(Math.random()); // Trigger a re-render of the SamplesContainer to fetch updated data
        }
    };  

    return (
        <div className="flex flex-column">
            <h2>Samples</h2>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <div>Submission tag: <strong>{submission_tag}</strong></div>
            </div>
            {canEdit && (
                <div style={{ width: "90%", display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                    <Button icon="edit" text="Edit Samples" intent="primary" onClick={() => setIsEditOpen(true)} />
                </div>
            )}
            <SamplesContainer
                updateTrigger={updateTrigger}
                submission_tag={submission_tag}
            />
            <EditSubmissionSamplesDialog
                submission_tag={submission_tag}
                isOpen={isEditOpen}
                onClose={handleClose}
            />
        </div>
    );
}