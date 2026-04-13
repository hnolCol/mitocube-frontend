import { Divider, Tooltip } from "@blueprintjs/core";
import { getFormatDateFromTimestamp } from "../../../services/date/format";
import MetricTable from "../base/metrictable";
import _ from "lodash"

import { StateIndicator } from "../base/states/SubmssionState";
import { AuthorList } from "../authors/AuthorList";


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



