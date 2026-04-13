
import _ from "lodash"  
import { CreatedAt } from './CreatedAt'
import { StateIndicator } from '../base/states/SubmssionState'

import hooks from "@mitocube/api-hooks"

export function TitleText({title}) {
    return <h4>{title}</h4>
}

export function N({ N, text = "N"}) {
    
    return <div>{text}: <strong>{N}</strong></div>
}


export function Content({ text }) {
    return (
        <div>
            {text}
        </div>
    )
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.userTag
 * @returns 
 */
export function UserName({ tag }) {

    const { isFetched, data: user, isSuccess, isLoading } = hooks.users.useGetPublicUserByTag({ tag }, { enabled: _.isString(tag) && tag.length > 0 })

    return (
        <div>
            {isFetched && isSuccess? <div><span>{user.firstname}</span><span>{user.lastname}</span></div> : isLoading ? <span>...</span> : null}
        </div>
    )
}


function SubmissionSummary({ meta_data }) {
    return (
        <div style={{width : "20rem"}}>
            <div className="flex justify-space-between center-items">
                <CreatedAt createdat={meta_data.created_at} />
                <StateIndicator state={meta_data.state} />
            </div>
            <TitleText title={meta_data.title} />
            <UserName tag={meta_data.user_tag} />
            <p>Samples: {meta_data.n_samples} ({meta_data.n_replicates} Replicates)</p>
        </div>
    )
}
