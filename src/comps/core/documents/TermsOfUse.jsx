import { Divider } from "@blueprintjs/core"
import { useGetTermsOfUse } from "../../../hooks/queries/terms.hook"
import { getFormatDateFromTimestamp } from "../../../services/date/format"
import Loading from "../base/loading"
import _ from "lodash"


function TermHeader({ useterms }) {
    //header of the use of terms 
    if (!_.isObject(useterms)) return null 
    const [m, fromatedTime] = getFormatDateFromTimestamp(useterms.created_on)
   
    return (
        <div>
            <h4>{useterms.title}</h4>
            <p>Authors: {_.join(useterms.authors.map((name,idx) => `${name}<${_.has(useterms,"authors_emails") ? useterms.author_emails[idx] : null }>`),", ")}</p>
            <p>Version : {useterms.version}</p>

        </div>
    )
}

function MainSection({useterms}) {

    if (!_.isArray(useterms.data_policy_sections)) return null     
    return (
        <div className="margin--medium" style={{ overflowY: "scroll" }}>
            
            {useterms.data_policy_sections.map(section => {
                return <div><h3>{section.header}</h3><p>{section.text}</p>
                    {_.has(section, "sections") && _.isArray(section.sections) ? 
                        <ul>{section.sections.map(text => <li>{text}</li>)}</ul>: null}</div>
            })}
        
        </div>
        )
}

function TermsSummary({ useterms }) {
    if (!_.isArray(useterms.summary_points)) return null 
    return (
        <div>
            <h2>Summary</h2>
            <ul>
                {useterms.summary_points.map(summaryPoint => <li>{summaryPoint}</li>)}
            </ul>
        </div>
    )
}


export function TermsOfUse() {

    const { data: useterms, isLoading, isFetching, isSuccess } = useGetTermsOfUse()
    
    return (<div style={{maxHeight : "800px", minWidth : "min(700,80vw)"}}>
        <h2>Use of terms</h2>

        {isLoading || isFetching ? <Loading /> : isSuccess && _.isObject(useterms) ? <div className="flex flex-column margin--medium" style={{height : "700px", overflowY:"scroll"} }> 
            <TermHeader {...{ useterms }} />
            <Divider />
            <MainSection {...{ useterms }} />
            <Divider />
            <TermsSummary {...{useterms}} />
        </div> : null }




    </div>)
}