import { api } from "@/api"
import { Loading } from "../core/base/states/Loading"
import MultipleMetrices from "../core/metrics/collection"

export function KeyFigure() {

    const { isLoading: isLoadingKeyFigures, data: keyFigures, isFetching: isFetchingKeyFigures } = api.info.keyfigures.useGetKeyFigures({}, {staleTime : 6000 * 24 * 60 * 1000}) 

    return (
        <div className="intent-margin-top">
                {isLoadingKeyFigures || isFetchingKeyFigures ? <Loading /> : <MultipleMetrices metrices={keyFigures}/> }
        </div>    
    )
}