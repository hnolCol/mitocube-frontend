import { api } from "@/api";
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display sparepart description
 * @param {Object} props  
 * @param {String} props.tag The tag of the sparepart to display the description
 */
export function SparepartDescription({tag, update}) {

    const {data : sparepartDescription, isError, error, isSuccess, refetch} = api.maintenance.spareparts.querySpareParts.useGetSparePartDescription({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(sparepartDescription)?sparepartDescription:null}</span>
}

