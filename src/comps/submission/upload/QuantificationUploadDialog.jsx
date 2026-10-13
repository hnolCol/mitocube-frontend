import { Dialog } from "@blueprintjs/core";
import { motion } from "framer-motion";
import _ from "lodash";
import { useState } from "react";
import { api } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { QuantificationUploader } from "../../core/base/files/QuantificationUploader";
import { HIGHLIGHT_COLOR } from "../../core/colors/colorPalette";

const QUANTIFICATION_TYPES = [
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
 * Dialog to upload quantification data (protein or precursor) to a submission.
 * The quantification type is selected inside the dialog. Large files are
 * uploaded in chunks by the underlying uploaders.
 *
 * @param {Object} props
 * @param {string} props.submission_tag - The submission tag to upload to.
 * @returns {JSX.Element}
 */
export function QuantificationUploadDialog({ submission_tag }) {
    const [isOpen, setOpen] = useState(false);
    const [quantificationType, setQuantificationType] = useState("protein");

    const { data: permissions, isSuccess } = api.submissions.permissions.useGetSubmissionPermissionsByTag(
        { tag: submission_tag },
        { staleTime: 60000 }
    );

    if (!isSuccess) return null;
    if (_.isObject(permissions) && !permissions.upload) return null;

    const activeType = QUANTIFICATION_TYPES.find((t) => t.key === quantificationType);

    const closeDialog = () => setOpen(false);

    return (
        <div className="flex flex-column" style={{ gap: "0.5rem" }}>
            <div className="flex" style={{ gap: "0.75rem" }}>
                <Dialog
                    isOpen={isOpen}
                    title={activeType.dialogTitle}
                    onClose={closeDialog}
                    canEscapeKeyClose={true}
                    canOutsideClickClose={false}
                >
                    <div style={{ display: "flex", gap: 8, padding: "12px 20px 0 20px" }}>
                        {QUANTIFICATION_TYPES.map((type) => {
                            const isActive = type.key === quantificationType;
                            return (
                                <button
                                    key={type.key}
                                    onClick={() => setQuantificationType(type.key)}
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
                        />
                    </div>
                </Dialog>
                <motion.button
                    className="upload-button bg--blue-light"
                    whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setOpen(true)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "10px 16px",
                        width: "auto",
                        height: "auto",
                        minHeight: 0,
                        maxWidth: "none",
                        border: "none",
                        borderRadius: 6,
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: 1.3,
                        whiteSpace: "normal",
                        textAlign: "left",
                    }}
                >
                    <span
                        style={{
                            marginRight: 8,
                            maxWidth: "140px",
                            display: "inline-block",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            verticalAlign: "middle",
                        }}
                    >
                        Upload Quantifications
                    </span>
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-label="arrow up"
                        style={{ verticalAlign: "middle" }}
                    >
                        <path
                            d="M10 15V5M10 5L5 10M10 5l5 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.button>
                <RecalculateStatisticsButton submission_tag={submission_tag} />
            </div>
        </div>
    );
}

function RecalculateStatisticsButton({ submission_tag }) {
    const queryClient = useQueryClient();
    const { data: samples } = api.submissions.samples.useGetSubmissionSamplesFull(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    );
    const excludedCount = _.isArray(samples) ? samples.filter((s) => s.excluded).length : 0;

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

    const disabled = isPending || isOutdatedLoading || !isOutdated;

    return (
        <div className="flex flex-column">
            <motion.button
                whileHover={disabled ? {} : { scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                whileTap={disabled ? {} : { scale: 0.97 }}
                disabled={disabled}
                onClick={() => recalculate({ tag: submission_tag })}
                className="basic-button"
                style={{
                    height: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 16px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled && !isPending ? 0.5 : 1,
                }}
            >
                {isPending ? "Recalculating..." : isOutdated ? "Recalculate Statistics" : "Statistics up to date"}
            </motion.button>
            {excludedCount > 0 ? (
                <span className="font-size--smallest" style={{ marginTop: "4px", color: "#b5560c" }}>
                    {excludedCount} sample{excludedCount > 1 ? "s" : ""} excluded from statistical analysis.
                </span>
            ) : null}
        </div>
    );
}
