import { useGetKeyFigures } from "../../hooks/queries/welcome.hooks"
import MultipleMetrices from "../core/metrics/collection"

export function KeyFigure() {

    const { isLoading: isLoadingKeyFigures, data: keyFigures, isFetching: isFetchingKeyFigures } = useGetKeyFigures()

    return (
        <div className="intent-margin-top">
                {isLoadingKeyFigures || isFetchingKeyFigures ? null : <MultipleMetrices metrices={keyFigures}/> }
        </div>    
    )
}