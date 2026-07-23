import Markdown from "react-markdown";
import { useEffect } from "react";
import { api } from "@/api";
import remarkGfm from 'remark-gfm'
import { Loading } from "@/comps/core/base/states/Loading";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import _ from "lodash";
import { CreatedAt } from "@/comps/core/metrics/CreatedAt";
import { UserName } from "@/comps/core/metrics/ItemBasics";
import Numeric from "@/comps/core/metrics/Numeric";

export function ProtocolSubmissions({ protocol_tag }) {
    const { data: submission_tags, isLoading, isError, error } = api.protocols.query.useGetSubmissionTagsByProtocolTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) })
    if (isLoading) return <Loading />
    if (isError) return <APIAxiosError error={error} />
    return <div className="flex flex-column" style={{gap : "0.5rem"}}>
        <Numeric metric={submission_tags?.length || 0} label="Linked Submissions"/>
    </div>
}


export function ProtocolView({ protocol_tag, handleEdit, updateTrigger }) { 

    const { data: protocol, isLoading, isError, error, isSuccess, refetch } = api.protocols.query.useGetProtocolByTag({ tag: protocol_tag }, { enabled: _.isString(protocol_tag) })
    console.log(updateTrigger, protocol_tag, protocol)
    useEffect(() => { if (_.isNumber(updateTrigger)) refetch() }, [updateTrigger])
    
    const isModified = protocol?.modified_at !== null && protocol?.modified_at !== protocol?.created_at && protocol?.modified_user_tags?.length > 0
    if (isLoading) return <Loading /> 
    if (isError) return <APIAxiosError error={error} />
    return (<div style={{ height: "95vh", overflowY: "scroll", padding: "2rem" }}>
        <div>
        <div className="flex" style={{ gap: "0.2rem" }}>
            <span>Created at: </span><CreatedAt createdat={protocol?.created_at } /> <span>by</span><UserName tag={protocol?.user_tag} /></div>
        {isModified ?
            <div className="flex" style={{ gap: "0.2rem" }}>
                <span>Last modified at: </span><CreatedAt createdat={protocol?.modified_at } />
                <span>by</span>
                <div className="flex">{protocol?.modified_user_tags.map(modified_user_tag => <UserName key={modified_user_tag} tag={modified_user_tag} />)}</div>
                </div> : null}
        </div>
        <div className="flex flex-column" style={{marginTop : "1rem", marginBottom : "1rem"}}>
            <ProtocolSubmissions protocol_tag={protocol_tag} />
        </div>
        <button className="basic-button basic-button--highlighted" onClick={() => { handleEdit() }}>Edit Protocol</button>
        <Markdown remarkPlugins={[remarkGfm]}>{"# " + protocol?.title + "\n\n" + protocol?.text || "No description available."}</Markdown>
    </div>)
}