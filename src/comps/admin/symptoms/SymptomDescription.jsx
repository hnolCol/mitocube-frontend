import { api } from "@/api";
import _ from "lodash"
import { useEffect } from "react"


/**
 * React component to display symptom description
 * @param {Object} props  
 * @param {String} props.tag The tag of the symptom to display the description
 */
export function SymptomDescription({tag, update}) {

    const {data : symptomDescription, isError, error, isSuccess, refetch} = api.maintenance.symptoms.querySymptoms.useGetSymptomDescription({tag : tag})
    
    if (isError) console.log(error)
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    return <span>{isSuccess ? symptomDescription : null}</span>

}
