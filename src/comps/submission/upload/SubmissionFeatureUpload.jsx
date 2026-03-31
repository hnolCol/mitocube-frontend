import { Dialog } from "@blueprintjs/core";
import hooks from "@mitocube/api-hooks"
import { motion } from "framer-motion"
import _ from "lodash"
import { ProteinQuantificationUploader } from "../../core/base/files/ChunkProteinUploader";
import { useState } from "react";
/**
 * Uploads a protein/peptides file to a submission. 
 * @param {*} param0 
 * @param {string} param0.feature_type The feature type to be uploaded. Can be protein or peptide. Default is protein.
 * @returns 
 */
export function SubmissionUpload({ submission_tag, feature_type = "protein" }) {
    const [dialogIsOpen, setDialogOpen] = useState(false);
    
    const { data: permissions, isSuccess } = hooks.submissions.permissions.useGetSubmissionPermissionsByTag({tag : submission_tag}, { staleTime: 60000 });
    
    if (!isSuccess) return null
    if (_.isObject(permissions) && !permissions.upload) return null 

    return (
        <div>

            <Dialog isOpen={dialogIsOpen} title="Upload Protein Quantifications" onClose={() => setDialogOpen(false)} canEscapeKeyClose={true} canOutsideClickClose={false} >
            <ProteinQuantificationUploader submission_tag={submission_tag}/>
            </Dialog>
            <motion.button className="upload-button bg--blue-light"  whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }} onClick={() => setDialogOpen(true)}>
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
        </div>
    )






}