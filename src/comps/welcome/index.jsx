
import PropTypes from "prop-types"
import MultipleMetrices from "../core/metrics/collection"
import Messages from "../core/messages"
import { useGetKeyFigures, useGetNews } from "../../hooks/queries/welcome.hooks"

Welcome.propTypes = {
    token: PropTypes.string.isRequired,

}

function Welcome({ token }) {

    
    const {isLoading : isLoadingNews, data : news, isFetching : isFetchingNews} = useGetNews({},{token})
    const { isLoading : isLoadingKeyFigures, data : keyFigures, isFetching : isFetchingKeyFigures} = useGetKeyFigures({},{token})
    
    return (
        <div className="flex flex-column center-items div--expand">
            <div className="main-header">
                Welcome to MitoCube
            </div>
            <div className="intent-margin-top">
                {isLoadingKeyFigures || isFetchingKeyFigures ? null : <MultipleMetrices metrices={keyFigures}/> }
            </div>    
            <div>
                {isLoadingNews || isFetchingNews ? null : <Messages messages={news}/>}
            </div>
        </div>
    )
}



export default Welcome