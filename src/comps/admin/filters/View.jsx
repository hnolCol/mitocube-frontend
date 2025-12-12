import { useGetFilters } from "../../../hooks/queries/filter.hooks"
import Loading from "../../core/base/loading"
import APIError from "../../core/error/APIerror"
import _ from "lodash"
import { FilterItem } from "./FilterItem"



export function FilterSetView({ }) {
    
    const {data, isLoading, isFetching, isError, error, isSuccess } = useGetFilters({})
    return (<div>

        {isError ? <APIError error={error} /> : isLoading || isFetching ? <Loading /> : <div>
            
            {isSuccess && _.isArray(data) ? data.map(filter => <FilterItem filter={filter} /> ): null }
            </div>}
        
    </div>)
}