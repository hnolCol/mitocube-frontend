import hooks from "@mitocube/api-hooks"
import _ from "lodash" 
import { Loading } from "../../core/base/states/Loading";
import { motion } from "framer-motion";


export function SubmissionProteinCount({ submission_tag }) {


    const { data : protein_count, isLoading } = hooks.submissions.counts.useGetSubmissionProteinCount({ tag : submission_tag }, { enabled: !!submission_tag, staleTime: 60000 });


    return (
        <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }}
            // onClick={handleCopy}
            className="submission-metric-view"
        >
            <div>
                <h4>Proteins</h4>
                {isLoading ? <Loading /> : <span>{protein_count}</span>}
            </div>
        </motion.button>
    );
}