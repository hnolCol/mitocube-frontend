import { useOutletContext } from "react-router";
import { useState } from "react";
import { Button } from "@blueprintjs/core";
import { SamplesContainer } from "./SampleContainer";
import { EditSubmissionSamplesDialog } from "./EditSampleDialog";
import _ from "lodash";

export function SubmissionSamples() {
    const { submission_tag } = useOutletContext();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [containerKey, setContainerKey] = useState(0);

    const handleClose = () => {
        setIsEditOpen(false);
        setContainerKey(prev => prev + 1); // forces SamplesContainer to remount and refetch
    };

    return (
        <div className="flex flex-column">
            <h2>Samples</h2>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <div>Submission tag: <strong>{submission_tag}</strong></div>
            </div>
            <div style={{ width: "80%", display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                <Button icon="edit" text="Edit Samples" intent="primary" onClick={() => setIsEditOpen(true)} />
            </div>
            <SamplesContainer
                key={containerKey}
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