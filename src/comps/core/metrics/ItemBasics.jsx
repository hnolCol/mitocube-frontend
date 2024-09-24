import { Link } from "react-router-dom"
import { getFormatDateFromTimestamp } from "../../../services/date/format"
import { useGetMetadata } from "../../../hooks/queries/datasets.hooks"
import { Tooltip } from "@blueprintjs/core"
import { useState } from "react"
import Loading from "../base/loading"
import { useGetFeatureInfo } from "../../../hooks/queries/feature.hooks"
import { TagWithTooltip } from "../base/tags/TagWithTooltip"
import { StateIndicator } from "../../submission/view/SubmissionContainer"
import { useGetPublicUserByTag } from "../../../hooks/queries/user.hooks"
import _ from "lodash"  
export function CraetedAt({ createdat, addFromNow = true }) {
    
    if (Math.log10(createdat) < 11) { //since the backend is python and is using 
        // seconds instead of miliseconds, check this first. 
        var createdat = createdat * 1000 
    }

    const [m, formatedTime] = getFormatDateFromTimestamp(createdat / 1000)
    return (
        <div style={{ fontSize: "0.8rem", color : "darkgrey"}}>
            {formatedTime} {addFromNow ? `(${ m.fromNow() })` : ''}
        </div>
    )
}

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
export function UserName({ userTag }) {
    const { isFetched, data: user, isSuccess, isLoading} = useGetPublicUserByTag({ tag: userTag },{ enabled : _.isString(userTag)})

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

export function FeatureLink({ tag }) {
    
    const [openedState, setOpenedState] = useState({hasOpened : false})
    const { data, isLoading, isFetching, isError, error, isSuccess } = useGetFeatureInfo ({ tag }, { enabled: openedState.hasOpened })
    
    return (
        <Tooltip inheritDarkTheme={false} content={
            <div className="padding--little">
                {isLoading || isFetching ?
                <Loading /> :
                    isSuccess ? <FeatureSummary {...{...data}} /> : null}</div>} onOpening={() => setOpenedState(true)}>
                <div className="padding--tiny"><Link to={`/features/${tag}`}>{tag}</Link></div>
        </Tooltip>
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
            <UserName userTag={meta_data.user_tag} />
            <p>Samples: {meta_data.n_samples} ({meta_data.n_replicates} Replicates)</p>
        </div>
    )
}

export function SubmissionLink({ tag }) {

    const [openedState, setOpenedState] = useState({hasOpened : false})
    const { data, isLoading, isFetching, isError, error, isSuccess } = useGetMetadata({ tag }, { enabled: openedState.hasOpened })

    
    return (
        <div className="flex">
            <div className="flex flex-column center-items">
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