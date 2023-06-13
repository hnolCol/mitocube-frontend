function APIError({ error }) {
    
    //display an error from axios 
    const errorResponse = error.response 
    return (
        <div className="flex flex-column center-items ">
            <div className="font-size--small font-color--red font-weight--bolder">
                The API returned an error. The error code was {errorResponse.status} (Status Text : {errorResponse.statusText})
            </div>
            <div className="font-size--smallest">
                Error Message : {error.message}
            </div>
        </div>
    )
}


export default APIError