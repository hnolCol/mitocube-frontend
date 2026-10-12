import { ContextMenu, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { Loading } from "../../core/base/states/Loading";
import _ from "lodash";
import { api } from "@/api";
import { CreatedAt } from "@/comps/core/metrics/CreatedAt";
import { ConsortiumSubmissionsCount } from "./Submissions";
import { ConsortiumUsersCount } from "./UsersCount";

/**
 * @description Displays a consortium in the admin overview with a context menu to edit its
 * research groups (members/users) and to view its shared submissions.
 * @param {Object} props
 * @param {String} props.tag Consortium tag
 * @param {Function} props.setEditGroupsDialog Setter for the edit groups dialog state
 * @param {Function} props.setSubmissionsDialog Setter for the submissions dialog state
 * @returns {JSX.Element} The consortium item card.
 */
export function ConsortiumItem({ tag, setEditGroupsDialog, setSubmissionsDialog }) {

    const { data: consortium, isSuccess, isLoading, isFetching } = api.consortiums.useGetConsortiumByTag({ tag }, { enabled: _.isString(tag), staleTime: Infinity })
    return (<div className="div--round padding--medium" style={{ backgroundColor: "#fefefe", width: "100%" }}>

    {isSuccess && _.isObject(consortium) ?<ContextMenu content={<Menu>
            <MenuItem text={`${consortium.text}`} disabled />
            <MenuDivider />
            <MenuItem text="Edit users" label="" onClick={() => setEditGroupsDialog(prevValues => { return { ...prevValues, isOpen: true, tag, title: `Edit research groups (users) for ${consortium.text}.` } })} />
            <MenuItem text="View submissions" label="" onClick={() => setSubmissionsDialog(prevValues => { return { ...prevValues, isOpen: true, tag, title: `Submissions shared with ${consortium.text}.` } })} />
            <MenuItem text="Delete" intent="danger" label="" disabled/>
        </Menu>}>
            <div className="flex justify-space-between" style={{width : "100%"}} >
                 <div className="flex flex-column justify-flex-start" style={{ gap: "0.2rem" }}>
            
                    <CreatedAt createdat={consortium.created_at} addFromNow={false} />
                
                    <div className="flex"><div><h4>{consortium.text}</h4></div><div>({consortium.abbreviation})</div></div>
                    <div className="font-size--smallest flex flex-column ">
                        <span>{consortium.profile_text}</span>
                        <span>Link : <a href={consortium.url} target="_blank" rel="noopener noreferrer">{consortium.url}</a></span>
                    </div>
                    
                    </div> 
                <div className="flex">
                    <ConsortiumUsersCount tag={tag} />
                    <ConsortiumSubmissionsCount tag={tag} onShowSubmissions={() => setSubmissionsDialog(prevValues => { return { ...prevValues, isOpen: true, tag, title: `Submissions shared with ${consortium.text}.` } })} />
                </div>
            </div>
        </ContextMenu> : isLoading || isFetching ? <Loading /> : null}
        
    </div>)
}
