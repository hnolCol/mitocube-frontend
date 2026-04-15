import { api } from "@/api";
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display sparepart text
 * @param {Object} props  
 * @param {String} props.tag The tag of the sparepart to display the text
 */
export function SparepartText({tag, update}) {

    const {data : sparepartText, isError, error, isSuccess, refetch} = api.maintenance.spareparts.querySpareParts.useGetSparePartText({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(sparepartText)?sparepartText:null}</span>
}

