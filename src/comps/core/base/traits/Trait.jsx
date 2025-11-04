import hooks from "@mitocube/api-hooks"
import _ from "lodash" 

export function Trait({ trait_tag }) { 
    const { data: trait, isSuccess } = hooks.traits.useGetTraitByTag({ tag: trait_tag }, {enabled: _.isString(trait_tag), staleTime: Infinity})
    return (
            <span>{isSuccess ? trait.text : null}</span>
    )


}