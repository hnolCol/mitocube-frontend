import { Dialog } from "@blueprintjs/core";
import _ from "lodash";
import { EditSample } from "./EditSample";
import { api } from "@/api";

export function EditSubmissionSamplesDialog({ submission_tag, isOpen, onClose }) {
    const { refetch } = api.submissions.samples.useGetSubmissionSamplesFull(
        { tag: submission_tag },
        { enabled: false } 
    );

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Samples"
            style={{ width: "95vw", height: "90vh" }}
        >
            <div style={{ padding: "1rem", height: "calc(90vh - 60px)", overflow: "auto" }}>
                {isOpen && _.isString(submission_tag) && (
                    <EditSample
                        submission_tag={submission_tag}
                        onClose={onClose}
                        refetch={refetch}
                    />
                )}
            </div>
        </Dialog>
    );
}