import hooks from "@mitocube/api-hooks"
import _ from "lodash";
import { motion } from "framer-motion";



export function SubmissionSampleCount({ submission_tag }) {
    const { data: sampleCount } = hooks.submissions.samples.useGetSubmissionSampleCount({ tag : submission_tag }, { enabled: !!submission_tag, staleTime: 60000 });

    return (
        <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }}
            // onClick={handleCopy}
            className="submission-metric-view"
        >
            <div>
                <h4>Samples</h4>
                <div>{sampleCount}</div>
            </div>
        </motion.button>
    );
}
