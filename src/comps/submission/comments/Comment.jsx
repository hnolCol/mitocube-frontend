import { MenuDivider } from "@blueprintjs/core";
import { MinimalUserIcon } from "../../core/base/user";
import { CreatedAt } from "../../core/metrics/CreatedAt";

export function Comment({comment}) {

    return <div className="bg--lightgrey">
        <div className="flex" style={{alignItems:"center"}}>
            <CreatedAt createdat={comment.created_at} />
       
            <MinimalUserIcon user_tag={comment.user_tag} />
        </div>
        <div>{comment.content}</div>
        
    </div>

}