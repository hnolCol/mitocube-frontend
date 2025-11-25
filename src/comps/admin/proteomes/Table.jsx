import { useRef } from "react";
import { useInView } from "framer-motion";
import _ from "lodash";

import Loading from "../../core/base/loading";
import { CreatedAt } from "../../core/metrics/CreatedAt";
import hooks from "@mitocube/api-hooks";





function ProteomeUpdating({ tag, can_update = false }) {
    const ref = useRef(null);
    // useInView returns a boolean, not an object
    const inView = useInView(ref, { amount: 0.2 });
    // use inView in the query options to enable polling only when visible
    const { data: isUpdating } = hooks.proteomes.useGetProteomeIsUpdating({tag}, { enabled: _.isString(tag) && inView, refetchInterval : inView ? 7500 : false});
    return (<div ref={ref} className="flex flex-column center-items">
        {isUpdating ? <span className="text--warning">Updating...</span> : <span className="text--success">Up to date</span>}
        {can_update && !isUpdating && <button  className="dialog-button">Update</button>}
    </div>)
}

function ProteomeItem({ tag, can_update = false }) {
    

    const { data: proteinCount } = hooks.proteomes.useGetProteomeProteinCount({ tag }, { enabled: _.isString(tag) });
    const { data: proteomeText } = hooks.proteomes.useGetProteomeText({ tag }, { enabled: _.isString(tag) });
    const { data: createdAt } = hooks.proteomes.useGetProteomeCreatedAt({ tag }, { enabled: _.isString(tag) });


    return <div className="flex justify-space-between padding--little margin--little bg--white div--round">
        <div className="flex center-items">
            <CreatedAt createdat={createdAt} />
            <div style={{height : "80%", borderLeft : "0.5px solid darkgrey", marginLeft : "1rem"}}></div>
            <div className="margin-left--medium" style={{width : "min(15rem, 30vw)"}}>
                <h4>{tag}</h4>
                <span className="font-size--small">{proteomeText}</span>
            </div>
            <div style={{height : "100%", borderLeft : "0.5px solid darkgrey", marginRight : "1rem"}} />
            <div className="flex center-items" style={{height: "100%"}}>
                
            <span>{`N: ${proteinCount}`}</span>
            </div>
        </div>
        <ProteomeUpdating tag={tag} can_update={can_update} />
        
        
    </div>
}


export function ProteomesView() {
    
    const { data : proteomes, isLoading } = hooks.proteomes.useGetProteomeBySearchString({search_string : "", limit : 20});
    const {data : count} = hooks.proteomes.useGetProteomeCount();
    const { data: proteomePermissions, isSuccess} = hooks.proteomes.useGetProteomePermissions({});
    

    return (

        <div>
            {isLoading ? <Loading /> : <div>
                <span>{`Total: ${_.isNumber(count) ? count : 'NaN'} proteome(s)`}</span>
                {_.isArray(proteomes) ? proteomes.map((proteome_tag, idx) =>
                    <ProteomeItem key={`${proteome_tag}-${idx}`} tag={proteome_tag} can_update={isSuccess &&proteomePermissions.update} />) : null}
            </div>}


            </div>
    )
}