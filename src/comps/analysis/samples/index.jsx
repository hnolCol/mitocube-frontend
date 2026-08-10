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
    const [containerKey, setContainerKey] = useState(0);

    const { data: permissions } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    );

    const canEdit = permissions?.edit === true;

    const { refetch: refetchExport } = api.samples.core.useGetSamplesExport(
        { tag: submission_tag },
        { enabled: false }
    );

    const handleDownload = async () => {
        const { data } = await refetchExport();
        if (!_.isArray(data) || data.length === 0) return;

        const columns = _.uniq(data.flatMap(row => Object.keys(row)));
        const orderedColumns = [
        "sample_tag",
        "replicate",
        "genotype",
        ...columns.filter(c => !["sample_tag", "replicate", "genotype"].includes(c))
        ];

        const lines = [
        orderedColumns.join("\t"),
        ...data.map(row => orderedColumns.map(col => row[col] ?? "").join("\t"))
        ];

        const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${submission_tag}_samples.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const handleClose = (e, updated = false) => {
        setIsEditOpen(false);
        setContainerKey(prev => prev + 1);
    };

    return (
        <div className="flex flex-column">
        <h2>Samples</h2>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <div>Submission tag: <strong>{submission_tag}</strong></div>
        </div>
        <div style={{ width: "80%", display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Button icon="download" text="Download" onClick={handleDownload} />
            {canEdit && (
            <Button icon="edit" text="Edit Samples" intent="primary" onClick={() => setIsEditOpen(true)} />
            )}
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