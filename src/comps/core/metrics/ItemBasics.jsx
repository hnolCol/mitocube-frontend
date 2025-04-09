import PropTypes from 'prop-types'
import { Link } from "react-router-dom"
import { getFormatDateFromTimestamp } from "../../../services/date/format"
import { useGetMetadata } from "../../../hooks/queries/datasets.hooks"
import { Tooltip } from "@blueprintjs/core"
import { useState } from "react"
import Loading from "../base/loading"
import { useGetFeatureInfo } from "../../../hooks/queries/feature.hooks"
import { TagWithTooltip } from "../base/tags/TagWithTooltip"
import { useGetPublicUserByTag } from "../../../hooks/queries/user.hooks"
import _ from "lodash"  
import { CraetedAt } from './CreatedAt'
import { StateIndicator } from '../base/states/SubmssionState'



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
    const { isFetched, data: user, isSuccess, isLoading} = useGetPublicUserByTag({ tag },{ enabled : _.isString(tag)})

    return (
        <div>
            {isFetched && isSuccess? <div><span>{user.firstname}</span><span>{user.lastname}</span></div> : isLoading ? <span>...</span> : null}
        </div>
    )
}


/**
 * 
 * @param {Object} props 
 * @param {import("../../../types/feature").Feature} props.i 
 * @param {[]} props.filters 
 * @returns 
 */
function FeatureSummary({ i, filters = [{ description: "MitoCarta", text: "MitoCarta 3.0" }] }) {
    return (
        <div style={{width : "20rem"}}>
            <TitleText title={i.gene_name} />
            {i.gene_names}
            {i.tag}
            {i.protein_name}

            {filters.length > 0 ? filters.map(filter => <TagWithTooltip tagText={filter.text} tooltipText={`${filter.description}`} />) : null}
            
        </div>

        
    )
}

function SubmissionSummary({ meta_data }) {
    return (
        <div style={{width : "20rem"}}>
            <div className="flex justify-space-between center-items">
                <CraetedAt createdat={meta_data.created_at} />
                <StateIndicator state={meta_data.state} />
            </div>
            <TitleText title={meta_data.title} />
            <UserName tag={meta_data.user_tag} />
            <p>Samples: {meta_data.n_samples} ({meta_data.n_replicates} Replicates)</p>
        </div>
    )
}

export function SubmissionLink({ tag }) {

    const [openedState, setOpenedState] = useState({hasOpened : false})
    const { data, isLoading, isFetching, isError, error, isSuccess } = useGetMetadata({ tag }, { enabled: openedState.hasOpened })

    
    return (
        <div className="flex">
            <div className="flex flex-column" style={{justifyContent:"center"}}>
                <div>Datasets:</div></div>
        <Tooltip inheritDarkTheme={false} content={
            <div className="padding--little">
                {isLoading || isFetching ?
                <Loading /> :
                isSuccess ? <SubmissionSummary meta_data={data}/> : null}</div>} onOpening={() => setOpenedState(true)}>
                <div className="padding--tiny"><Link to={`/datasets/${tag}`}>{tag}</Link></div>
            </Tooltip>
        </div>
    )
}