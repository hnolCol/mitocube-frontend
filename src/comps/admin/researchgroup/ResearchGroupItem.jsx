import { ContextMenu, Menu, MenuItem } from "@blueprintjs/core";
import { motion } from "framer-motion";
import { useGetResearchGroupByTag } from "../../../hooks/queries/researchgroup.hooks";
import { CraetedAt } from "../../core/metrics/CreatedAt";
import { Loading } from "../../core/base/states/Loading";
import _ from "lodash"

export function ResearchGroupItem({ tag, setEditUsersDialog }) {
    
    const { data: research_group, isSuccess, isLoading, isFetching } = useGetResearchGroupByTag({ tag })
    
    
 
    return (<div>

    {isSuccess && _.isObject(research_group) ?<ContextMenu content={<Menu>
            <MenuItem text={`${research_group.name}`} disabled/>
            <MenuItem text="Users" label="Add/Remove users." onClick={() => setEditUsersDialog(prevValues => { return { ...prevValues, isOpen: true, tag, title: `Edit users for ${research_group.name}.` } })} />
            <MenuItem text="Block all users" label="Not implemented yet." />
            <MenuItem text="Delete" intent="danger" label="Not implemented yet."/>
        </Menu>}>
            <motion.div style={{
                backgroundColor: "#ffffff",
                color: "#00000"
            }}
                className="padding--medium margin--medium div--round"
                whileHover={{
                    backgroundColor: "#fefefe",
                    color: "#00000"
                }}>
                 <div>
                
                    <CraetedAt createdat={research_group.created_at} />
                
                    <div className="flex"><div><h4>{research_group.name}</h4></div><div>({research_group.abbreviation})</div></div>
                    <div className="font-size--smallest">{research_group.address}</div>
                    </div> 
                
            </motion.div>
        </ContextMenu> : isLoading || isFetching ? <Loading /> : null}
        
    </div>)
}