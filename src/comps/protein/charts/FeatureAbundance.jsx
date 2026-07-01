
import _ from "lodash"
import { Boxplot } from "../../core/charts/boxplot/Boxplot";
import { useState } from "react";
import { MinimalAttributeSelection } from "../../core/base/attributes/MinimalAttributeSelection";
import { api } from "@/api";
import { OptionButton } from "../../core/base/buttons/OptionButton";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";

const VALUE_TYPES = [{ value: "raw", label: "Raw" }, { value: "z_score_sample", label: "Z Score " }]


export function ProteinAbundance({ tag }) {
    const [abundanceProps, setAbundanceProps] = useState({ attribute_tag: undefined, rerender: undefined, value_type: "z_score_sample" }) 
    
    const attributeDefined = _.has(abundanceProps,"attribute_tag")
    const proteome_abundance = {}

    
    const { data: sample_feature_abundance } = api.features.quantifications.useGetSampleFeatureAbundanceDistribution({
        tag,
        attribute_tag: abundanceProps.attribute_tag,
        value: abundanceProps.value_type
    },
        {
            enabled: _.isString(tag),
            staleTime: 3000000,
            onSuccess: (d) => setAbundanceProps(prevValues => { return { ...prevValues, rerender: Math.random() } })
        })
   
    const handleAttributeSelection = (attribute_tag) => {
        if (attributeDefined && attribute_tag === abundanceProps.attribute_tag) {
            setAbundanceProps(prevValues => {return {...prevValues, attribute_tag : undefined, rerender : Math.random()}})
        } 
        else {
            setAbundanceProps(prevValues => {return {...prevValues, attribute_tag : attribute_tag, rerender : Math.random()}})
        }
        
    }

    const boxplotData = _.isObject(sample_feature_abundance) ? _.keys(sample_feature_abundance).map(k => sample_feature_abundance[k]) : []
    return <div>
        
        <MinimalAttributeSelection onAttributeSelect={handleAttributeSelection} selectedItem={abundanceProps.attribute_tag} attribute_groups={_.join(["dataset","sample"], ";")}/>
        <div>
            {VALUE_TYPES.map(value_type => <OptionButton
                key={value_type.value}
                isSelected={abundanceProps.value_type === value_type.value}
                onClick={() => setAbundanceProps(prevValues => ({ ...prevValues, value_type: value_type.value, rerender: Math.random() }))}
                children={<span>{value_type.label}</span>} />)}
        </div>
        
        {boxplotData.length > 0 ? <WithTagMaps Component={Boxplot} ca_tags={_.keys(sample_feature_abundance)} attribute_tags={[]} {...{
            width: 30 + (55 * (boxplotData.length + 1)),
            data: boxplotData,
            rerender: abundanceProps.rerender,
            xaxis_ca_tags: _.keys(sample_feature_abundance), yAxisLabel: abundanceProps.value_type === "raw" ? "log2 intensity" : "Z Score",
            
        }} /> : null}

    
    </div>
}