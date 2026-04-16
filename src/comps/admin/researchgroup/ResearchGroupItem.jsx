import { ContextMenu, Menu, MenuItem } from "@blueprintjs/core";
import { Loading } from "../../core/base/states/Loading";
import _ from "lodash"
import { api } from "@/api";
import { CreatedAt } from "@/comps/core/metrics/CreatedAt";
import { ResearchGroupUsersCount } from "./ResearchGroupUsersCount";

export function ResearchGroupItem({ tag, setEditUsersDialog }) {
    
    const { data: research_group, isSuccess, isLoading, isFetching } = api.researchgroups.useGetResearchGroupByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    return (<div>

    {isSuccess && _.isObject(research_group) ?<ContextMenu content={<Menu>
            <MenuItem text={`${research_group.name}`} disabled/>
            <MenuItem text="Users" label="Add/Remove users." onClick={() => setEditUsersDialog(prevValues => { return { ...prevValues, isOpen: true, tag, title: `Edit users for ${research_group.name}.` } })} />
            <MenuItem text="Block all users" label="Not implemented yet." />
            <MenuItem text="Delete" intent="danger" label="Not implemented yet."/>
        </Menu>}>
            <div className="flex justify-space-between" style={{width : "100%"}}>
                 <div className="flex flex-column justify-flex-start" style={{ gap: "0.2rem" }}>
            
                    <CreatedAt createdat={research_group.created_at} addFromNow={false} />
                
                    <div className="flex"><div><h4>{research_group.text}</h4></div><div>({research_group.abbreviation})</div></div>
                    <div className="font-size--smallest flex flex-column ">
                        <span>{research_group.address}</span>
                        <span>Link : <a href={research_group.url} target="_blank" rel="noopener noreferrer">{research_group.url}</a></span>
                    </div>
                    
                    </div> 
                <div>
                    <span>Statistics</span>
                    <ResearchGroupUsersCount tag={tag} />
                </div>
            </div>
        </ContextMenu> : isLoading || isFetching ? <Loading /> : null}
        
    </div>)
}