import { useGetFeatureAbundanceByTag } from "../../../hooks/queries/feature.hooks";
import { useGetProteomeAbundaneDist } from "../../../hooks/queries/proteome.hooks";
import _ from "lodash"
import { Boxplot } from "../../core/charts/boxplot/Boxplot";
import { useState } from "react";
import { MinimalAttributeSelection } from "../../core/base/attributes/MinimalAttributeSelection";



export function ProteinAbundance({ tag, proteome_tag }) {
    const [abundanceProps, setAbundanceProps] = useState({ attribute: undefined, rerender: undefined }) 
    
    const attributeDefined = _.has(abundanceProps,"attribute.tag")

    const { data: proteome_abundance } = useGetProteomeAbundaneDist({ tag: "UP000005640" },{enabled : _.isString(proteome_tag), staleTime : Infinity})
    const { data: feature_abundance } = useGetFeatureAbundanceByTag({ tag: tag , attribute_tag :  attributeDefined?abundanceProps.attribute.tag:undefined }, {enabled : _.isString(tag), staleTime : 30000000})
        
    const handleAttributeSelection = (attribute) => {
        if (attributeDefined && attribute.tag === abundanceProps.attribute.tag) {
            setAbundanceProps(prevValues => {return {...prevValues, attribute : undefined, rerender : Math.random()}})
        } 
        else {
            setAbundanceProps(prevValues => {return {...prevValues, attribute, rerender : Math.random()}})
        }
        


    }

    const boxplotData = _.flatten([proteome_abundance, feature_abundance]).filter(d => !_.isEmpty(d))
    
    return <div>
        
        <MinimalAttributeSelection onAttributeSelect={handleAttributeSelection} selectedItem={attributeDefined?abundanceProps.attribute:{}}/>
        
        {_.isObject(proteome_abundance) && _.isObject(feature_abundance) ?
            <Boxplot width={30+(55*(boxplotData.length+1))} data={boxplotData} rerender={abundanceProps.rerender} /> : null}
    
    </div>
}