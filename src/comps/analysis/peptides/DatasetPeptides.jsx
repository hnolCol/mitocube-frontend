import { useOutletContext } from "react-router";
import PeptidesLoad from "./PeptidesLoad";

/**
 * Main peptides analysis component for dataset view.
 * 
 * This is the entry point for the peptides analysis tab.
 * It uses the submission_tag from the outlet context and passes it to PeptidesLoad.
 * 
 * @returns {JSX.Element}
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
