import {motion } from "framer-motion"
import PropTypes from "prop-types"; 
import { useState } from "react";
import { copyTextToClipboard } from "../../../services/clipboard";
import { HIGHLIGHT_COLOR } from "../../core/colors/colorPalette";

export function SubmissionTag({ submission_tag, fontColor = "#000000" }) { 
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            copyTextToClipboard(submission_tag);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            // fallback or error handling
        }
    };
    return (
        <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="submission-metric-view"
            title="Click to copy"
        >
            <div>
                <h4>Tag</h4>
                {!copied ? <div style={{ color: fontColor }}>{submission_tag}</div> : null}
            {copied && (
                <span
                    style={{
                        marginLeft: "0.5em",
                        color: HIGHLIGHT_COLOR,
                        fontWeight: 600,
                        fontSize: "12px",
                        verticalAlign: "middle",
                    }}
                >
                    ✓ Copied!
                </span>
                )}
                </div>
        </motion.button>
    );
}