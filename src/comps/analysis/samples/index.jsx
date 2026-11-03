import hooks from "@mitocube/api-hooks";
import { useOutletContext } from "react-router";
import { useState } from "react";
import { Callout } from "@blueprintjs/core";
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
        { enabled: _.isString(submission_tag), staleTime: 60000 }
    );

    const canEdit = permissions?.edit === true;

    const { refetch: refetchExport } = api.samples.core.useGetSamplesExport(
        { tag: submission_tag },
        { enabled: false }
    );

    const { data: samplesFull } = api.submissions.samples.useGetSubmissionSamplesFull(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: 60000 }
    );

    const lostSamples = _.isArray(samplesFull)
        ? samplesFull.filter((s) => s?.lost === true)
        : [];

    const handleDownload = async () => {
        const { data } = await refetchExport();
        if (!_.isArray(data) || data.length === 0) return;

        const columns = _.uniq(data.flatMap(row => Object.keys(row)));
        const fixedColumns = ["sample_name", "sample_tag", "replicate", "genotype"];
        const orderedColumns = [
            ...fixedColumns.filter(c => columns.includes(c)),
            ...columns.filter(c => !fixedColumns.includes(c))
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
        {lostSamples.length > 0 ? (
            <Callout
                intent="warning"
                icon="warning-sign"
                style={{ width: "80%", marginBottom: "0.5rem" }}
            >
                <strong>{lostSamples.length} lost {lostSamples.length === 1 ? "sample" : "samples"}</strong>{" "}
                in this submission: {lostSamples.map((s) => s.tag).join(", ")}. Lost samples are
                ignored in statistical analysis.
            </Callout>
        ) : null}
        <div style={{ width: "80%", display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <button className="basic-button--small" onClick={handleDownload}>Download</button>
            {canEdit && (
                <div style={{ width: "90%", display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                    <button className="basic-button--small" onClick={() => setIsEditOpen(true)}>Edit Samples</button>
                </div>
            )}
        </div>
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