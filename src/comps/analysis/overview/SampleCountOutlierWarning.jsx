import { api } from "@/api";
import _ from "lodash";

/**
 * Shows a warning below the sample count when quantification data exists and
 * some samples have a significantly different protein group count than the
 * cohort. A sample is flagged when its count deviates more than 3 median
 * absolute deviations (MAD) from the cohort median.
 *
 * @param {Object} props
 * @param {string} props.submission_tag
 * @returns {JSX.Element|null}
 */
export function SampleCountOutlierWarning({ submission_tag }) {
    const { data: quantificationExists } = api.submissions.quantifications.useGetSubmissionQuantificationExists(
        { tag: submission_tag, quantification_type: "protein_groups" },
        { staleTime: 60000, enabled: _.isString(submission_tag) }
    );

    const { data: pgCount } = api.submissions.counts.useGetSubmissionProteinGroupCount(
        { tag: submission_tag },
        { staleTime: 60000, enabled: _.isString(submission_tag) && quantificationExists === true }
    );

    const { data: samplePGCounts } = api.submissions.counts.useGetSubmissionSampleProteinGroupCount(
        { tag: submission_tag },
        { staleTime: 60000, enabled: _.isString(submission_tag) && quantificationExists === true }
    );

    if (!quantificationExists || !_.isNumber(pgCount) || !_.isArray(samplePGCounts) || samplePGCounts.length === 0) {
        return null;
    }

    const counts = samplePGCounts.map((c) => c.count).filter(_.isNumber);
    if (counts.length < 3) return null;

    const median = (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    };

    const cohortMedian = median(counts);
    const mad = median(counts.map((c) => Math.abs(c - cohortMedian)));
    if (mad === 0) return null;

    const outlierThreshold = 3 * mad;
    const outliers = samplePGCounts.filter((c) => _.isNumber(c.count) && Math.abs(c.count - cohortMedian) > outlierThreshold);

    if (outliers.length === 0) return null;

    return (
        <span className="font-size--smallest" style={{ marginTop: "4px", color: "#b5560c" }}>
            {outliers.length === 1 ? "1 sample has" : `${outliers.length} samples have`} a protein group count
            strongly deviating from the cohort median ({_.round(cohortMedian)}).{" "}
            {outliers.slice(0, 3).map((o) => o.tag).join(", ")}
            {outliers.length > 3 ? `, …` : ""} — consider checking the QC tab and excluding outlier samples.
        </span>
    );
}
