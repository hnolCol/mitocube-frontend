import { ProteinQuantCounts } from "./ProteinCount";
import { api } from "@/api";
import _ from "lodash"
import { ProteinFavorite } from "./ProteinFavorite";

export function ProteinOverview({ feature_tag }) {
    const { data: feature, isSuccess } = api.features.proteinsQuery.useGetProteinByTag({ tag: feature_tag }, { enabled: _.isString(feature_tag), staleTime: Infinity })

    return (<div className="flex flex-column div--expand">
        <h3>Protein Overview</h3>
        <div className="flex flex-column div--expand padding--little" style={{alignItems : "flex-start"}}> {isSuccess ? feature.gene_name : null} | <div>{isSuccess ? feature.protein_name : null}</div></div>
        <div><ProteinQuantCounts tag={feature_tag} /></div>
        <ProteinFavorite tag={feature_tag} />
        </div>
       )

}
