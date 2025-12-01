import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display spare part price
 * @param {Object} props  
 * @param {String} props.tag The tag of the spare part to display the price
 */
export function SparepartPrice({tag, update}) {

    const {data : sparepartPrice, isError, error, isSuccess, refetch} = hooks.maintenance.spareparts.useGetSparePartPrice({tag : tag})
    
    if (isError) console.log(error)
    useEffect(() =>{
        if (_.isNumber(update)) refetch()
        
    }, [update])

    return <span>{isSuccess ? sparepartPrice : null}</span>

}           
