import { useState } from "react"

import hooks from "@mitocube/api-hooks"


/**
 * @description Feature representation including a link to the /feature/<tag> url. Feature data are loaded upon tooltip opening.
 * @param {object} props 
 * @param {String} props.tag - The feature tag
 * @returns 
 */
export function FeatureLink({ tag }) {
    
    const [openedState, setOpenedState] = useState({hasOpened : false})
    const { data, isLoading, isFetching, isError, error, isSuccess } = hooks.features.useGetFeatureInfo({ tag }, { enabled: openedState.hasOpened })

    return (
        <Tooltip inheritDarkTheme={false} content={
            <div className="padding--little">
                {isLoading || isFetching ?
                <Loading /> :
                    isSuccess ? <FeatureSummary {...{...data}} /> : null}</div>} onOpening={() => setOpenedState(true)}>
            <div className="padding--tiny"><Link to={`/features/${tag}`}>`{`${tag} ${isSuccess?`${data.gene_name}`:null}`}</Link></div>
        </Tooltip>
    )
}
