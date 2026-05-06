// // import { Loading } from "../base/states/Loading"
// import APIError from "../error/APIerror"
// import { FilterSummary } from "./FilterSummary"
// import _ from "lodash"

// export function ProteinFilter({ tag }) {

//     const { data : filterTags, isLoading, isError, error } = hooks.filters.useGetFilters({protein_tag : tag}, {staleTime : 60000})

//     return <div>
//         <h4>Protein Filter Tags</h4>
//         <p>The protein is associated with the following protein filter tags:</p>
//         {isLoading ? <Loading /> : isError ? <APIError error={error} /> : null}
//         {_.isArray(filterTags) ? filterTags.length === 0 ?
//             <div className="font-size--smallest"><p>The protein is not present in any of the filter sets.</p></div>
        
//             : <div>{filterTags.map(filter_tag => <FilterSummary key={filter_tag} tag={filter_tag} />)} </div> : null}

//     </div>
// }
