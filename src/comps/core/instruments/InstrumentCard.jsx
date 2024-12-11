import { Card, Divider, Tooltip } from "@blueprintjs/core";
import { useGetInstrumentStatsByTag } from "../../../hooks/queries/instrument.hooks";
import { getFormatDateFromTimestamp } from "../../../services/date/format";
import MetricTable from "../base/metrictable";
import _ from "lodash"
import Loading from "../base/loading"
import APIError from "../error/APIerror"
import { getUserFullName } from "../../../services/format/user";
import { useNavigate } from "react-router";
import { StateIndicator } from "../base/states/SubmssionState";
import { AuthorList } from "../authors/SubmissionAuthorList";


export function SubmissionMiniSummary({miniSubmission}){
    return (<div>
        <h4>{miniSubmission.title}</h4>
        <p>Label : {miniSubmission.label}</p>
        <p>Samples : {miniSubmission.number_samples}</p>
    </div>)
}

function InstrumentStats({stats}) {
    const [m, formattedDate] = getFormatDateFromTimestamp(stats.first_use)
    
    const metrices = [
        { text: "First use", value: formattedDate },
        { text: "Datasets", value: `${stats.number_datasets} (${_.round(stats.relative_number_datasets * 100)}%)` },
        { text: "Published datasets", value: stats.number_datasets_published},
        { text: "Samples", value: stats.number_samples }
    ]
    return (
        <div>
            {stats.is_measuring ? <div className="flex flex-column center-items">
                <Tooltip content={<SubmissionMiniSummary miniSubmission={stats.is_measuring_submission}/>} compact={true}>
                    <StateIndicator state={2} />
                </Tooltip>
                <div className="flex flex-column">
                <div className="flex flex-column center-items">
                        <div>{stats.is_measuring_submission.title}, {stats.is_measuring_submission.number_samples} samples</div>
                        
                <AuthorList user={stats.is_measuring_submission.user_label} collaborators={[]} />
                </div><Divider/></div>
            </div> : null}
            <MetricTable data={metrices} />
        </div>
    )
}


/**
 * 
 * @param {Object} props 
 * @param {import("../../../types/attributes").AttributeValue} props.instrument 
 * @returns 
 */
export function InstrumentCart({instrument}) {
    const redirect = useNavigate()
    
    const {data : stats, isLoading, isFetching, isError, error} = useGetInstrumentStatsByTag({tag : instrument.tag})
    return (
        <Card compact={true} interactive={true} elevation={1} style={{maxWidth : "min(700px,33vw)"}} onClick={() => redirect(`/performance/instruments/${instrument.value}`)}>
            <h3>{instrument.text}</h3>
            <p>{instrument.description}</p>
            
            <div >
                {isError ? <APIError error={error} /> :
                    isLoading || isFetching ?
                        <Loading /> :
                        <InstrumentStats {...{ stats }} />}
                
            </div>


        </Card>
    )
}


