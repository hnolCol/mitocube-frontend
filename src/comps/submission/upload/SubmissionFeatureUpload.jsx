import { Dialog } from "@blueprintjs/core";
import { motion } from "framer-motion"
import _ from "lodash"
import { ProteinQuantificationUploader } from "../../core/base/files/ChunkProteinUploader";
import { useState } from "react";
import { api } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
/**
 * Uploads a protein/peptides file to a submission. 
 * @param {*} param0 
 * @param {string} param0.feature_type The feature type to be uploaded. Can be protein or peptide. Default is protein.
 * @returns 
 */
export function SubmissionUpload({ submission_tag, feature_type = "protein" }) {
    const [dialogIsOpen, setDialogOpen] = useState(false);
    
    const { data: permissions, isSuccess } = api.submissions.permissions.useGetSubmissionPermissionsByTag({tag : submission_tag}, { staleTime: 60000 });
    
    if (!isSuccess) return null
    if (_.isObject(permissions) && !permissions.upload) return null 

    return (
        <div className="flex flex-column" style={{ gap: "0.5rem" }}>
            <div className="flex" style={{ gap: "0.75rem" }}>

            <Dialog isOpen={dialogIsOpen} title="Upload Protein Quantifications" onClose={() => setDialogOpen(false)} canEscapeKeyClose={true} canOutsideClickClose={false} >
            <ProteinQuantificationUploader submission_tag={submission_tag}/>
            </Dialog>
            <motion.button className="upload-button bg--blue-light"  whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }} onClick={() => setDialogOpen(true)}
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
            }}>
                <span
                    style={{
                        marginRight: 8,
                        maxWidth: "140px",
                        display: "inline-block",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        verticalAlign: "middle"
                    }}
                >
                    Upload Protein Quantifications
                </span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="arrow up" style={{ verticalAlign: "middle" }}>
                    <path d="M10 15V5M10 5L5 10M10 5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </motion.button>
            <RecalculateStatisticsButton submission_tag={submission_tag} />
            </div> 
        </div>
    )

}


function RecalculateStatisticsButton({ submission_tag }) {
    const queryClient = useQueryClient()
    const { data: samples } = api.submissions.samples.useGetSubmissionSamplesFull({ tag: submission_tag }, { enabled: _.isString(submission_tag) })
    const excludedCount = _.isArray(samples) ? samples.filter(s => s.excluded).length : 0

    const { data: isOutdated, isLoading: isOutdatedLoading } = api.submissions.quantifications.useGetStatsOutdated(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )

    const { mutate: recalculate, isPending } = api.submissions.quantifications.useRecalculateStatistics({
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["getStatsOutdated", submission_tag] })
            queryClient.invalidateQueries({ queryKey: ["getSubmissionHeatmap"] })
            queryClient.invalidateQueries({ queryKey: ["getSubmissionPCA"] })
        }
    })

    const disabled = isPending || isOutdatedLoading || !isOutdated

    return (
        <div className="flex flex-column" >
            <motion.button
                whileHover={disabled ? {} : { scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                whileTap={disabled ? {} : { scale: 0.97 }}
                disabled={disabled}
                onClick={() => recalculate({ tag: submission_tag })}
                className="basic-button"
                style={{
                    height : "100%",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "10px 16px", borderRadius: 6, fontSize: 14, fontWeight: 500,
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled && !isPending ? 0.5 : 1,
                }}>
                {isPending ? "Recalculating..." : isOutdated ? "Recalculate Statistics" : "Statistics up to date"}
            </motion.button>
            {excludedCount > 0 ? (
                <span className="font-size--smallest" style={{ marginTop: "4px", color: "#b5560c" }}>
                    {excludedCount} sample{excludedCount > 1 ? "s" : ""} excluded from statistical analysis.
                </span>
            ) : null}
        </div>
    )
}