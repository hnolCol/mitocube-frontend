import { api } from "@/api";
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display sparepart link
 * @param {Object} props  
 * @param {String} props.tag The tag of the sparepart to display the link
 */
export function SparepartLink({tag, update}) {

    const {data : sparepartLink, isError, error, isSuccess, refetch} = api.maintenance.spareparts.querySpareParts.useGetSparePartLink({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])
    // console.log(sparepartLink)
    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(sparepartLink)?sparepartLink:null}</span>
}

