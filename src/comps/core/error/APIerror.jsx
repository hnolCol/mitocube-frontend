import _ from "lodash"

function APIError({ error }) {
    //display an error from axios 

    const errorResponse = error.response 
    var extraDetail = " "
    if (_.has(errorResponse, ["data", "detail"]) && _.isString(errorResponse.data.detail)) {
        extraDetail = errorResponse.data.detail
    }
    if (errorResponse === undefined) return <p>Unknown error.</p>
    return (
        <div className="flex flex-column center-items ">
            <div className="font-size--small font-color--red font-weight--bold">
                <div className="margin-bottom--little">{extraDetail}</div>
                
                <p>
                    The API returned an error. The error code :{errorResponse.status} (Status Text : {errorResponse.statusText}) </p>
                {/* <div style={{maxHeight : "500px", overflowY:"scroll"}}>
                    {_.isObject(errorResponse.data.detail) ?
                        <ReactJson src={errorResponse.data} /> : null}
                </div> */}
                <div style={{maxWidth : "550px"}}>
                    <pre style={{ overflow: "auto", maxHeight: 500 }}>
                    {JSON.stringify(errorResponse.data, null, 2)}
                        </pre>
                </div>
            
               
            </div>
            <div className="font-size--smallest">
                Error Message : {error.message}
            </div>
        </div>
    )
}


export default APIError