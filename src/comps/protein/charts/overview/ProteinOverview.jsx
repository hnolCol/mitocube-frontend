import { ProteinQuantCounts } from "./ProteinCount";
import hooks from "@mitocube/api-hooks" 
import _ from "lodash"

export function ProteinOverview({ feature_tag }) {
    const { data: feature, isSuccess } = hooks.features.proteins.useGetProteinByTag({ tag: feature_tag }, { enabled: _.isString(feature_tag), staleTime: Infinity })

    return (<div className="flex flex-column div--expand">
        <h3>Protein Overview</h3>
        <div className="flex div--expand padding--little"> {isSuccess ? feature.gene_name : null} | <div>{isSuccess ? feature.protein_name : null}</div></div>
         <div><ProteinQuantCounts tag={feature_tag} /></div>
        </div>
       )

}
