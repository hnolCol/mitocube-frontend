import { ProteinQuantCounts } from "./ProteinCount";
import { api } from "@/api";
import _ from "lodash"
import { ProteinFavorite } from "./ProteinFavorite";
import { ProteinAnnotationTree } from "./ProteinAnnotationTree";
import { ProteinGroupsDisplay } from "./ProteinGroup";

export function ProteinOverview({ feature_tag }) {
    const { data: feature, isSuccess } = api.features.proteinsQuery.useGetProteinByTag({ tag: feature_tag }, { enabled: _.isString(feature_tag), staleTime: Infinity })

    return (
        <div className="flex flex-column div--expand">
            <h3>Protein Overview</h3>
            <div className="flex flex-column padding--little" style={{ alignItems: "flex-start" }}>
                {isSuccess ? feature.gene_name : null} | <div>{isSuccess ? feature.protein_name : null}</div>
            </div>
            <ProteinGroupsDisplay proteinTag={feature_tag} />
            <div className="flex flex--wrap align-start" style={{ gap: "2rem", marginTop: "1rem" }}>
                <div className="container--shadow padding--little margin-top--little" 
                    style={{ width: "28vw", minWidth: "20vw", maxHeight: "min(50vh,500px)", overflowY: "hidden" }}>
                    <ProteinAnnotationTree proteinTag={feature_tag} />
                </div>
            </div>
            <div className="div--expand" />
            <div><ProteinQuantCounts tag={feature_tag} /></div>
            <ProteinFavorite tag={feature_tag} />
        </div>
    );
}