import { api } from "@/api"
import _ from "lodash" 

export function Trait({ trait_tag }) { 
    const { data: trait, isSuccess } = api.traits.queryTraits.useGetTraitByTag({ tag: trait_tag }, {enabled: _.isString(trait_tag), staleTime: Infinity})
    return (
            <span>{isSuccess ? trait.text : null}</span>
    )


}