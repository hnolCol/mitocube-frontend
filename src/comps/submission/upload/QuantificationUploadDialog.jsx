import { Dialog } from "@blueprintjs/core";
import _ from "lodash";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { QuantificationUploader } from "../../core/base/files/QuantificationUploader";
import { HIGHLIGHT_COLOR } from "../../core/colors/colorPalette";
import TooltipButton from "@/comps/core/base/buttons/TooltipButton";

const UPLOAD_TYPES = [
    {
        key: "protein",
        label: "Protein Quantifications",
        dialogTitle: "Upload Protein Quantifications",
        description: "Long format, tab-separated. Requires sample, value and protein group columns.",
    },
    {
        key: "precursor",
        label: "Precursor Quantifications",
        dialogTitle: "Upload Precursor Quantifications",
        description: "Long format, tab-separated. Requires sample, stripped sequence, value, score, retention time, charge and protein group columns.",
    },
];

/**
 * Compact quick access bar buttons for curators and admins to upload quantification
 * data to a submission and to recalculate the submission statistics. The upload
 * button opens a dialog with protein/precursor type selection; the recalculate
 * button is only enabled while the statistics are outdated. Both render nothing
 * if the user has no upload permission for the submission.
 *
 * @param {Object} props
 * @param {string} props.submission_tag - The submission tag.
 * @returns {JSX.Element|null}
 */
export function QuantificationActions({ submission_tag }) {
    const { data: permissions, isSuccess } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag },
        { staleTime: 60000 }
    );
    if (!isSuccess) return null;
    if (_.isObject(permissions) && !permissions.upload) return null;
    return (
        <>
            <QuantificationUploadButton submission_tag={submission_tag} />
            <RecalculateStatisticsButton submission_tag={submission_tag} />
        </>
    );
}

function QuantificationUploadButton({ submission_tag }) {
    const [isOpen, setOpen] = useState(false);
    const [quantificationType, setQuantificationType] = useState("protein");
    const [uploadInProgress, setUploadInProgress] = useState(false);
    const confirmWhileUploading = useCallback(
        (action) => {
            if (uploadInProgress && !window.confirm("An upload is still in progress. Closing the dialog or navigating away will abort it. Continue?")) {
                return;
            }
            action();
        },
        [uploadInProgress]
    );
    // Warn when the user leaves the page while an upload is running
    useEffect(() => {
        if (!uploadInProgress) return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [uploadInProgress]);
    const activeType = UPLOAD_TYPES.find((t) => t.key === quantificationType);
    const closeDialog = () => confirmWhileUploading(() => setOpen(false));
    return (
        <>
            <Dialog
                isOpen={isOpen}
                title={activeType.dialogTitle}
                onClose={closeDialog}
                canEscapeKeyClose={!uploadInProgress}
                canOutsideClickClose={false}
            >
                <div style={{ display: "flex", gap: 8, padding: "12px 20px 0 20px" }}>
                    {UPLOAD_TYPES.map((type) => {
                        const isActive = type.key === quantificationType;
                        return (
                            <button
                                key={type.key}
                                onClick={() => confirmWhileUploading(() => setQuantificationType(type.key))}
                                style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    border: `1px solid ${isActive ? HIGHLIGHT_COLOR : "#d1d5db"}`,
                                    borderRadius: 6,
                                    background: isActive ? HIGHLIGHT_COLOR : "#fff",
                                    color: isActive ? "#fff" : "#374151",
                                    fontWeight: 500,
                                    fontSize: 14,
                                    cursor: "pointer",
                                }}
                            >
                                {type.label}
                            </button>
                        );
                    })}
                </div>
                <div style={{ padding: "8px 20px 0 20px", fontSize: 13, color: "#6b7280" }}>
                    {activeType.description}
                </div>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <QuantificationUploader
                        key={quantificationType}
                        submission_tag={submission_tag}
                        quantification_type={quantificationType}
                        onUploadStatusChange={(status) => setUploadInProgress(status === "uploading")}
                    />
                </div>
            </Dialog>
            <TooltipButton
                icon="upload"
                content="Upload protein or precursor quantifications for this submission"
                onClick={() => setOpen(true)}
            />
        </>
    );
}

function RecalculateStatisticsButton({ submission_tag }) {
    const queryClient = useQueryClient();
    const { data: isOutdated, isLoading: isOutdatedLoading } = api.submissions.quantifications.useGetStatsOutdated(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    );
    const { mutate: recalculate, isPending } = api.submissions.quantifications.useRecalculateStatistics({
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["getStatsOutdated", submission_tag] });
            queryClient.invalidateQueries({ queryKey: ["getSubmissionHeatmap"] });
            queryClient.invalidateQueries({ queryKey: ["getSubmissionPCA"] });
        },
    });
    return (
        <TooltipButton
            icon="refresh"
            loading={isPending}
            disabled={isPending || isOutdatedLoading || !isOutdated}
            content={isPending ? "Recalculating statistics ..."
                : isOutdated ? "Statistics are outdated. Click to recalculate."
                    : "Statistics are up to date"}
            onClick={() => recalculate({ tag: submission_tag })}
        />
    );
}

export { QuantificationActions as SubmissionUpload };
