import { useGetFeatureAbundanceByTag } from "../../../hooks/queries/feature.hooks";
import { useGetProteomeAbundaneDist } from "../../../hooks/queries/proteome.hooks";
import _ from "lodash"
import { Boxplot } from "../../core/charts/boxplot/Boxplot";
import { useState } from "react";
import { MinimalAttributeSelection } from "../../core/base/attributes/MinimalAttributeSelection";

import hooks from "@mitocube/api-hooks"

export function ProteinAbundance({ tag }) {
    console.log(tag, "feature abundance tag")
    const [abundanceProps, setAbundanceProps] = useState({ attribute: undefined, rerender: undefined }) 
    
    const attributeDefined = _.has(abundanceProps,"attribute.tag")
    const proteome_abundance = {}
    // const { data: proteome_abundance } = useGetProteomeAbundaneDist({ tag: "UP000005640" },{enabled : _.isString(proteome_tag), staleTime : Infinity})
    // const { data: feature_abundance } = useGetFeatureAbundanceByTag({ tag: tag , attribute_tag :  attributeDefined?abundanceProps.attribute:undefined }, {enabled : _.isString(tag), staleTime : 30000000})
    
    const { data : sample_feature_abundance } = hooks.features.quantification.useGetSampleFeatureAbundanceDistribution({tag, attribute_tag : "att_subcellular_compartment", value : "raw"}, {enabled : _.isString(tag), staleTime : 3000000})
   console.log(sample_feature_abundance)
   
   
    const handleAttributeSelection = (attribute) => {
        // if (attributeDefined && attribute.tag === abundanceProps.attribute.tag) {
        //     setAbundanceProps(prevValues => {return {...prevValues, attribute : undefined, rerender : Math.random()}})
        // } 
        // else {
        //     setAbundanceProps(prevValues => {return {...prevValues, attribute, rerender : Math.random()}})
        // }
        


    }

    // const boxplotData = _.flatten([proteome_abundance, feature_abundance]).filter(d => !_.isEmpty(d))
    const boxplotData = _.isObject(sample_feature_abundance) ? _.keys(sample_feature_abundance).map(k => sample_feature_abundance[k] ) : []
    console.log(boxplotData, "boxplot data")
    return <div>
        
        <MinimalAttributeSelection onAttributeSelect={handleAttributeSelection} selectedItem={{}}/>
        
        
        <Boxplot width={30+(55*(boxplotData.length+1))} data={boxplotData} rerender={Math.random()} xaxis_ca_tags={_.keys(sample_feature_abundance)}   />
    
    </div>
}