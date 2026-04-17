import { api } from "@/api";
import _ from "lodash" 
import { Loading } from "../../core/base/states/Loading";
import { motion } from "framer-motion";


export function SubmissionPeptideCount({ submission_tag }) {


    const { data : peptide_count, isLoading } = api.submissions.counts.useGetSubmissionPeptideCount({ tag : submission_tag }, { enabled: !!submission_tag, staleTime: 60000 });


    return (
        <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }}
            // onClick={handleCopy}
            className="submission-metric-view"
        >
            <div>
                <h4>Peptides</h4>
                {isLoading ? <Loading /> : <span>{peptide_count}</span>}
            </div>
        </motion.button>
    );
}