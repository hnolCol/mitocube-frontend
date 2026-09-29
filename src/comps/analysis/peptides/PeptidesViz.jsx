import { useState } from "react";
import _ from "lodash";

import { Loading } from "@/comps/core/base/states/Loading";

/**
 * Main peptides visualization component.
 * Placeholder for peptides visualization - API endpoint to be added later.
 */
function PeptidesViz({
    submission_tag,
    peptidesData,
    isLoading,
    caTagMap,
    attributeTagMap,
    proteinTagMap,
    isReady,
    proteinIsLoading,
    proteinSearchResults,
    setRequiredProteinTags,
    showHoverLabels
}) {
    if (isLoading) return <Loading />;
    if (!isReady) return <Loading />;

    return (
        <div className="div--expand" style={{ overflowY: "scroll", height: "90vh" }}>
            <p>Peptides analysis visualization will be added here.</p>
            <p>Data: {JSON.stringify(peptidesData, null, 2)}</p>
        </div>
    );
}

export default PeptidesViz;
