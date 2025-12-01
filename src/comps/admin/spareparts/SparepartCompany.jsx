import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display sparepart company
 * @param {Object} props  
 * @param {String} props.tag The tag of the sparepart to display the company
 */
export function SparepartCompany({tag, update}) {

    const {data : sparepartCompany, isError, error, isSuccess, refetch} = hooks.maintenance.spareparts.useGetSparePartCompany({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(sparepartCompany)?sparepartCompany:null}</span>
}

