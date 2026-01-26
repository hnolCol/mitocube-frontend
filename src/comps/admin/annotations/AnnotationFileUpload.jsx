import { Dialog } from "@blueprintjs/core";
import { motion } from "framer-motion";
import { useState } from "react";
import { AnnotationsChunkUploader } from "../../admin/annotations/AnnotationChunkUploader";

export function AnnotationUpload({ onProteinIdsLoaded }) {
  const [dialogIsOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <Dialog
        isOpen={dialogIsOpen}
        title="Upload protein IDs from file"
        onClose={() => setDialogOpen(false)}
        canEscapeKeyClose
        canOutsideClickClose
      >
        <AnnotationsChunkUploader
          onProteinIdsLoaded={(ids) => {
            onProteinIdsLoaded(ids);
            setDialogOpen(false); 
          }}
        />
      </Dialog>
      <motion.button
        className="upload-button bg--blue-light"
        whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setDialogOpen(true)}
        style={{
          width: "200px",
          height: "60px",
          padding: "0 0.75rem",
          display: "flex",
          alignItems: "center",         
          justifyContent: "space-between",
          fontSize: "0.85rem",
        }}
      >
        <span
          style={{
            lineHeight: "1.2",
            whiteSpace: "normal",       
            wordBreak: "break-word",    
            flex: 1,                     
            marginRight: "0.5rem",
          }}
        >
          Upload Protein File
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          aria-label="arrow up"
          style={{
            flexShrink: 0,
            opacity: 0.9,
          }}
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


    </div>
  );
}
