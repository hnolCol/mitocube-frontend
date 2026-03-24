
import _ from "lodash"
import hooks from "@mitocube/api-hooks" 

export function ProteinQuantCounts({ tag }) {
    
    const { data : feature} = hooks.features.proteins.useGetProteinByTag({ tag: tag }, { enabled: _.isString(tag), staleTime: Infinity })
    const { data: sampleCounts } = hooks.samples.useGetSampleCount({ has_protein_quantification: true })
    const { data: featureSampleCounts } = hooks.samples.useGetSampleCount({ protein_group_tag: tag, has_protein_quantification: true })

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
