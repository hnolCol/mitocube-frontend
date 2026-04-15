import { api } from "@/api";
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display symptoms text
 * @param {Object} props  
 * @param {String} props.tag The tag of the symptom to display the text
 */
export function SymptomText({tag, update}) {

    const {data : symptomText, isError, error, isSuccess, refetch} = api.maintenance.symptoms.querySymptoms.useGetSymptomText({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(symptomText)?symptomText:null}</span>
}

