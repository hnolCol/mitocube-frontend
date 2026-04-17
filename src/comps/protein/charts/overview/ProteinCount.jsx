
import _ from "lodash"
import { api } from "@/api"

export function ProteinQuantCounts({ tag }) {
    
    const { data : feature} = api.features.proteinsQuery.useGetProteinByTag({ tag: tag }, { enabled: _.isString(tag), staleTime: Infinity })
    
    const { data: sampleCounts } = api.samples.count.useGetSampleCount({ has_protein_quantification: true })
    const { data: featureSampleCounts } = api.samples.count.useGetSampleCount({ protein_group_tag: tag, has_protein_quantification: true })

    if (!_.isNumber(sampleCounts) || !_.isNumber(featureSampleCounts)) return null


    

    const rel = featureSampleCounts / sampleCounts

    const percent = +(rel * 100).toFixed(1);

    return (
        <div>
            <div>
                {feature ? feature.gene_name : null} was quantified in <strong>{percent}%</strong> ({featureSampleCounts}/{sampleCounts}) of samples from the same proteome.
            </div>
            {rel < 0.15 && (
                <div>
                    The feature is likely expressed at <strong>very low levels</strong> and/or only under <strong>specific conditions</strong>.
                </div>
            )}
        </div>
    )
}
