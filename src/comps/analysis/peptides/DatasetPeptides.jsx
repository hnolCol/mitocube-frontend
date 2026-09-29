import { useOutletContext } from "react-router";
import PeptidesLoad from "./PeptidesLoad";

/**
 * Main peptides analysis component for dataset view.
 * Uses the submission_tag from the outlet context.
 */
function DatasetPeptides() {
    const { submission_tag } = useOutletContext();

    return (
        <div>
            <h2>Peptides</h2>
            <PeptidesLoad submission_tag={submission_tag} />
        </div>
    );
}

export default DatasetPeptides;
