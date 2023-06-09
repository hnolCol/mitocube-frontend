import { useQuery } from "react-query";
import PropTypes from "prop-types"
import axios from "axios"
// export enum DatasetQueryKeys {

// }



async function getDatasets_API(filters) {
    const res = await axios.get('/api/dataset/details', { params: { filters : filters } })
    return res.data 

}

export const useGetDatasets = (filters = {}, useQueryOptions = {}) => {
    return useQuery(["getDatasets",filters],() => getDatasets_API(filters), useQueryOptions)
}


useGetDatasets.propTypes = {
    useQueryOptions : PropTypes.object
}