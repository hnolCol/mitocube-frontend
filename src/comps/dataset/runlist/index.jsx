import PropTypes from "prop-types"
import _ from "lodash"
import { useOutletContext } from "react-router"
import { useGetRunlist } from "../../../hooks/queries/submission.hooks"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"


function Runlist() {

    const { dataset_label, metadata } = useOutletContext()   
    
    const { data: runlist, isLoading, isFetching, isSuccess, isError, error} = useGetRunlist({submission_label : dataset_label})
    
    return (
        <div>
            <h2>Runlist</h2>
            <p>Find the analytical runs associated with the projects below.</p>
            {isLoading | isFetching ? <Loading /> : isError ? <APIError error={error} /> : isSuccess ? <div>
                <p>{runlist.n_runs}</p>
            </div> :
                null}
            
        </div>
    )
}


export default Runlist