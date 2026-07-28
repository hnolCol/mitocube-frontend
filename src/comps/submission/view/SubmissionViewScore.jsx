import { api } from "@/api";
import _ from "lodash";
import { motion } from "framer-motion";



export function SubmissionViewScore({ submission_tag, fontColor = "#000000" }) {
    const { data: score } = api.submissions.views.useGetSubmissionViewScore({ tag : submission_tag }, { enabled: !!submission_tag, staleTime: 60000 });

    return (
        <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }}
            // onClick={handleCopy}
            className="submission-metric-view"
        >
            <div>
                <h4>Trending Score</h4>
                <div style={{ color: fontColor }}>{_.round(score,2)}</div>
            </div>
        </motion.button>
    );
}



