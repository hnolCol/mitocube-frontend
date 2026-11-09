import { useOutletContext } from "react-router";
import HeatmapLoad from "./HeatmapLoad";
import { useIsSmallScreen } from "../../../hooks/useViewport";
import { SmallScreenWarning } from "../../core/base/SmallScreenWarning";

/**
 * Main heatmap analysis component for dataset view.
 * Uses the submission_tag from the outlet context.
 */
function DatasetHeatmap() {
    const { submission_tag } = useOutletContext();
    const isSmallScreen = useIsSmallScreen();

    if (isSmallScreen) {
        return (
            <div>
                <h2>Hierarchical Clustering</h2>
                <SmallScreenWarning feature="Heatmaps" />
            </div>
        );
    }

    return (
        <div>
            <h2>Hierarchical Clustering</h2>
            <HeatmapLoad submission_tag={submission_tag} />
        </div>
    );
}

export default DatasetHeatmap;
