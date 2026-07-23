
import { useEffect } from "react";
import {api} from "@/api";
import _ from "lodash";
import { APIAxiosError } from "@/comps/core/base/states/APIError";
import { ProtocolMinimalItem } from "./ProtocolMinimalItem";
export function ProtocolsContainer({ search_string, submission_tags = [], limit = 50, trigger_update = undefined, onClick = () => {} }) {

    const {data : protocol_tags, refetch : updateQuery, isError, error} = api.protocols.query.useGetProtocolsByQuery({ search_string, submission_tags : _.join(submission_tags, ";"), limit }, {staleTime : 1000 * 60 * 5, placeholderData : (prev) => prev || []})
    useEffect(() => { if (_.isNumber(trigger_update)) { updateQuery(); } }, [trigger_update])
    console.log(error, error?.response?.data, error?.response?.status)
    console.log("ProtocolsContainer : protocol_tags", protocol_tags)
    return <div className="flex flex-column padding--medium">
        {isError ? <APIAxiosError error={error} /> : protocol_tags?.length > 0 ? protocol_tags.map(protocol_tag =>
            <div key={protocol_tag}><ProtocolMinimalItem protocol_tag={protocol_tag} onClick={() => onClick(protocol_tag)} /></div>) : <div>No protocols found</div>}
    </div>


}