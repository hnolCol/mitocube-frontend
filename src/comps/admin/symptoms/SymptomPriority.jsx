import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display symptom priority
 * @param {Object} props  
 * @param {String} props.tag The tag of the symptom to display the priority
 */
export function SymptomPriority({tag, update}) {

    const {data : symptomPriority, isError, error, isSuccess, refetch} = hooks.maintenance.symptoms.useGetSymptomPriority({tag : tag})
    
    if (isError) console.log(error)
    useEffect(() =>{
        if (_.isNumber(update)) refetch()
        
    }, [update])

    return <span>{isSuccess ? symptomPriority : null}</span>

}           
