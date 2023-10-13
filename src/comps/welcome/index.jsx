
import PropTypes from "prop-types"
import MultipleMetrices from "../core/metrics/collection"
import Messages from "../core/messages"
import { useGetBackendInfo, useGetKeyFigures, useGetNews } from "../../hooks/queries/welcome.hooks"
import _ from "lodash"

Welcome.propTypes = {
    authenticationStatus: PropTypes.object.isRequired,
    applicationInfo: PropTypes.object.isRequired,
    setApplicationInfo : PropTypes.func.isRequired
}


function KeyFigure({ authenticationStatus }) {

    const { isLoading: isLoadingKeyFigures, data: keyFigures, isFetching: isFetchingKeyFigures } = useGetKeyFigures({ tokenString: authenticationStatus.token })

    return (
        <div className="intent-margin-top">
                {isLoadingKeyFigures || isFetchingKeyFigures ? null : <MultipleMetrices metrices={keyFigures}/> }
        </div>    
    )
}

function Welcome({ authenticationStatus}) {
    //const enabled = _.isObject(authenticationStatus) && authenticationStatus.token
    const { isLoading: backendInfoLoading, data : backendInfo } = useGetBackendInfo({ tokenString: authenticationStatus.token })
    
    // const { isLoading: isLoadingNews, data: news, isFetching: isFetchingNews } = useGetNews(
    //     { tokenString: authenticationStatus.token },
    //     )
    
    return (
        <div className="flex flex-column center-items div--expand">
            <div className="main-header">
                {backendInfoLoading || !_.isObject(backendInfo) ? null : `Welcome to ${backendInfo.app_name}`}
            </div>
            <div>
                <p>{backendInfoLoading || !_.isObject(backendInfo) && _.isString(backendInfo.app_description)? null : `${backendInfo.app_description}`}</p>
            </div>
            <KeyFigure {...{authenticationStatus}} />
            {/* <div>
                {isLoadingNews || isFetchingNews ? null : <Messages messages={news}/>}
            </div> */}
        </div>
    )
}



export default Welcome