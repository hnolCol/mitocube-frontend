import { Outlet } from "react-router";
import Tabs from "../../core/navigation/tabs";

/**
 * Header of the cross-submission analysis section. In contrast to the
 * submission-scoped analysis views (PCA, volcano, heatmap ... under
 * /submissions/:tag), this section pools all submissions of a proteome
 * that are inside the requesting user's submission scope.
 */
function CrossSubmissionAnalysisHeader() {

    return (
        <div>
            <Tabs tabs={[
                { text: "Pooled PCA", to: "/analysis/pca" }]} />
            <div className="intent-margin-top">
                <Outlet />
            </div>
        </div>
    )
}

export default CrossSubmissionAnalysisHeader
