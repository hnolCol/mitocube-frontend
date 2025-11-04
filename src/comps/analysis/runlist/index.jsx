import PropTypes from "prop-types"
import _ from "lodash"
import { useOutletContext } from "react-router"
import { useGetRunlist } from "../../../hooks/queries/submission.hooks"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { WellPosition } from "../../core/plate/wellplate"
import { getFormatDateFromTimestamp } from "../../../services/date/format"

/**
 * 
 * @param {Object} props
 * @param {import("../../../types/submissions").Run} props.run 
 * @returns 
 */
function Run({ run }) {
    
    const [m, formatedTime] = getFormatDateFromTimestamp(run.measured_at)
    return (<div className="div--round bg--lightgrey padding--little flex">
        <h5>{run.name}</h5>
        <WellPosition {...{ positionLabel: run.position_label }} />
        <div>Plate : {run.plate_index}</div>
        
    </div>)
}


function Runlist() {

    const { dataset_label, metadata } = useOutletContext()   
    
    const { data: runlist, isLoading, isFetching, isSuccess, isError, error} = useGetRunlist({submission_label : dataset_label})
    console.log(runlist)
    return (
        <div>
            <h2>Runlist</h2>
            <p>Find the analytical runs associated with the projects below.</p>
            {isLoading | isFetching ? <Loading /> : isError ? <APIError error={error} /> : isSuccess ? <div>
                <p>{runlist.n_runs}</p>
                <div className="flex flex-column div--expand">
                    {runlist.runs.map(run => <Run run={run} />)}
                </div>
            </div> :
                null}
            
        </div>
    )
}


export default Runlist