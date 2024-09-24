import { Button, Checkbox, InputGroup } from "@blueprintjs/core";
import { useState } from "react";
import _ from "lodash"
import { useGetProteomes } from "../../../hooks/queries/proteome.hooks";
import Loading from "../../core/base/loading"
import { getFormatDateFromTimestamp } from "../../../services/date/format";

function ProteomeItem({ idx, proteome }) {
    
    const [m, formatedTime] = getFormatDateFromTimestamp(proteome.created_at/1000)
    const [modm, modFormatedTime] = getFormatDateFromTimestamp(proteome.modified_at/1000)

    return <div className="padding--little margin--little bg--white div--round"> 
         <div>{formatedTime}. last.modified {modm.fromNow()}</div>
            <h4>{proteome.text}</h4>
            <p style={{ fontSize: "0.6rem" }}>{proteome.description}</p>
    </div>
}


export function ProteomesView({ }) {
    

    const {isLoading, data} = useGetProteomes()
    
    console.log(data)

    
    return (

        <div>
            {isLoading ? <Loading /> : <div>
                <p>{data.length} proteomes found.</p>
                {data.map((proteome, idx) => <ProteomeItem key={`${proteome.tag}`} {...{proteome,idx}} />)}
            </div>}


            </div>

    )
}