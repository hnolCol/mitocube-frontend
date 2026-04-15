import { api } from "@/api"
import _ from "lodash"
import { useEffect } from "react"

/**
 * React component to display external service description
 * @param {Object} props  
 * @param {String} props.tag The tag of the  external service to get the description
 */
export function ExternalServiceDescription({tag, update}) {

    const {data : ExternalServiceDescription, isError, error, isSuccess, refetch} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceDescription({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(ExternalServiceDescription)?ExternalServiceDescription:null}</span>
}

/**
 * React component to display external service name
 * @param {Object} props  
 * @param {String} props.tag The tag of the external service to get the name
 */
export function ExternalServiceName({tag, update}) {

    const {data : ExternalServiceName, isError, error, isSuccess, refetch} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceName({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(ExternalServiceName)?ExternalServiceName:null}</span>
}


/**
 * React component to display external service company name
 * @param {Object} props  
 * @param {String} props.tag The tag of the external service to get the company name
 */
export function ExternalServiceCompany({tag, update}) {

    const {data : ExternalServiceCompany, isError, error, isSuccess, refetch} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceCompany({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(ExternalServiceCompany)?ExternalServiceCompany:null}</span>
}

/**
 * React component to display external service email
 * @param {Object} props  
 * @param {String} props.tag The tag of the external service to get the email
 */
export function ExternalServiceEmail({tag, update}) {

    const {data : ExternalServiceEmail, isError, error, isSuccess, refetch} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceEmail({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(ExternalServiceEmail)?ExternalServiceEmail:null}</span>
}

/**
 * React component to display external service cost
 * @param {Object} props  
 * @param {String} props.tag The tag of the external service to get the cost
 */
export function ExternalServiceCosts({tag, update}) {

    const {data : ExternalServiceCosts, isError, error, isSuccess, refetch} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceCosts({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess ? ExternalServiceCosts : null}</span>

}

/**
 * React component to display external service billing number
 * @param {Object} props  
 * @param {String} props.tag The tag of the external service to get the billing number
 */

export function ExternalServiceBillingNumber({tag, update}) {

    const {data : ExternalServiceBillingNumber, isError, error, isSuccess, refetch} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceBillingNumber({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(ExternalServiceBillingNumber)?ExternalServiceBillingNumber:null}</span>
}

/**
 * React component to display external service internal ID 
 * @param {Object} props  
 * @param {String} props.tag The tag of the external service to get the internal ID 
 */

export function ExternalServiceInternalID({tag, update}) {

    const {data : ExternalServiceInternalID, isError, error, isSuccess, refetch} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceInternalID({tag : tag})
    useEffect(() =>{
        if (update) refetch()
        
    }, [update])

    if (isError) console.log(error)


    return <span>{isSuccess && _.isString(ExternalServiceInternalID)?ExternalServiceInternalID:null}</span>
}

