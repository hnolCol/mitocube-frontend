import { useOutletContext } from "react-router";
import PCALoader from "./PCALoader";

/**
 * Main PCA analysis component for dataset view.
 * Uses the submission_tag from the outlet context.
 */
function DatasetPCA() {
    /**
     * @type {import("../../../types/datasets").DatasetContextOutlet}
     */
    const { submission_tag } = useOutletContext();

    return <PCALoader submission_tag={submission_tag} />;
}

export default DatasetPCA;
