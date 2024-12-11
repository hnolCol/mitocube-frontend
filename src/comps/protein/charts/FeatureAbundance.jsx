import { useGetFeatureAbundanceByTag } from "../../../hooks/queries/feature.hooks";
import { useGetProteomeAbundaneDist } from "../../../hooks/queries/proteome.hooks";
import _ from "lodash"
import CategoricalBoxplot from "../../core/charts/categorical/boxplot";
import { Boxplot } from "../../core/charts/boxplot/Boxplot";



export function ProteinAbundance({ tag, proteome_tag }) {
    
    const { data: proteome_abundance } = useGetProteomeAbundaneDist({ tag: "UP000005640" },{enabled : _.isString(proteome_tag), staleTime : Infinity})
    const { data: feature_abundance } = useGetFeatureAbundanceByTag({ tag: tag }, {enabled : _.isString(tag), staleTime : 30000000})
    

    console.log(proteome_abundance, feature_abundance)

    return <div>
        
        {_.isObject(proteome_abundance) && _.isObject(feature_abundance) ? <Boxplot data={[proteome_abundance, feature_abundance]} /> : null}
    
    </div>
}