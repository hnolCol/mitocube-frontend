import { api } from "@/api";
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display sparepart product ID
 * @param {Object} props  
 * @param {String} props.tag The tag of the sparepart to display the product ID
 */
export function SparepartProductID({tag, update}) {

    const {data : sparepartProductID, isError, error, isSuccess, refetch} = api.maintenance.spareparts.querySpareParts.useGetSparePartProductID({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(sparepartProductID)?sparepartProductID:null}</span>
}

