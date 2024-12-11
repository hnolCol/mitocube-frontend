import _ from "lodash"
import ReactJson from 'react-json-view'
import PropTypes from 'prop-types'
import { isAxiosError } from "axios"


const checkError = (props, propName, componentName) => {
    if (!isAxiosError(props[propName])) return new Error(
        `Invalid prop ${propName} passed to ${componentName}. Expected an AxiosError.`
    )
}

export function APIAxiosError({ error }) {
    //display an error from axios 
    const errorResponse = error.response 
    var extraDetail = " "
    if (_.has(errorResponse, ["data", "detail"]) && _.isString(errorResponse.data.detail)) {
        extraDetail = errorResponse.data.detail
    }
    if (errorResponse === undefined) return <p>Unknown error (No error response included).</p>
    return (
        <div className="flex flex-column center-items ">
            <div className="font-size--small font-color--red font-weight--bold">
                <div className="intent-margin-bottom--little">{extraDetail}</div>
                <p>
                    The API returned an error. The error code is:{errorResponse.status}<br/>(Status Text : {errorResponse.statusText}) </p>
                <div style={{maxHeight : "500px", overflowY:"scroll"}}>
                    {_.isObject(errorResponse.data.detail)?<ReactJson src={errorResponse.data} />: null}
                </div>
               
            </div>
            <div className="font-size--smallest">
                Error Message : {error.message}
            </div>
        </div>
    )
}


APIAxiosError.propTypes = {
    error : checkError
}