import _ from "lodash"

function APIError({ error }) {
    //display an error from axios 
    const errorResponse = error.response 
    console.log(errorResponse)
    var extraDetail = " "
    if (_.has(errorResponse, ["data", "detail"])) {
        extraDetail = errorResponse.data.detail
    }
    return (
        <div className="flex flex-column center-items ">
            <div className="font-size--small font-color--red font-weight--bold">
                <div className="intent-margin-bottom--little">{extraDetail}</div>
                <p>
                The API returned an error. The error code :{errorResponse.status} (Status Text : {errorResponse.statusText})
                </p>
            </div>
            <div className="font-size--smallest">
                Error Message : {error.message}
            </div>
        </div>
    )
}


export default APIError