import { useOutletContext } from "react-router";
import HeatmapLoad from "./HeatmapLoad";

/**
 * Main heatmap analysis component for dataset view.
 * Uses the submission_tag from the outlet context.
 */
function DatasetHeatmap() {
    const { submission_tag } = useOutletContext();

    return (
        <div>
            <h2>Hierarchical Clustering</h2>
            <HeatmapLoad submission_tag={submission_tag} />
        </div>
    );
}

export default DatasetHeatmap;
