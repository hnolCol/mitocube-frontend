import { api } from "@/api";
import _ from "lodash";
import { Loading } from "../../core/base/states/Loading";
import { motion } from "framer-motion";

/**
 * Precursor count chip. Uses the precursor count endpoint once available in
 * api-hooks (api.submissions.counts.useGetSubmissionPrecursorCount); falls
 * back to the boolean has-precursors endpoint and shows Yes/None otherwise.
 */
export function SubmissionPrecursorCount({ submission_tag, fontColor = "#000000" }) {
    const hasCountHook = _.has(api, "submissions.counts.useGetSubmissionPrecursorCount");
    const { data: precursor_count, isLoading } = hasCountHook
        ? api.submissions.counts.useGetSubmissionPrecursorCount(
              { tag: submission_tag },
              { enabled: _.isString(submission_tag), staleTime: 60000 }
          )
        : api.submissions.analysis.useGetSubmissionHasPrecursors(
              { submission_tag },
              { enabled: _.isString(submission_tag), staleTime: 60000 }
          );

    return (
        <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
            whileTap={{ scale: 0.97 }}
            className="submission-metric-view"
        >
            <div>
                <h4>Precursors</h4>
                {isLoading ? (
                    <Loading />
                ) : (
                    <span style={{ color: fontColor }}>
                        {hasCountHook ? (_.isNumber(precursor_count) ? precursor_count : "–") : precursor_count ? "Yes" : "None"}
                    </span>
                )}
            </div>
        </motion.button>
    );
}
