



import PropTypes from "prop-types"
import _ from "lodash"
import { useGetDatasetMitoLoc } from "../../hooks/queries/datasets.hooks"
import APIError from "../core/error/APIerror"
import CollapsableScatter from "../core/charts/collapsableCharts/scatter"
import Loading from "../core/base/loading"

function PTM({}) {

    //const data = [{ "T": "HEK", "y" : 6, N : "GG"},{ "T": "HEK", "y" : 4, N : "GG"},{ "T": "Macrophages", "y" : 16 , N : "GG"} ,{ "T": "HeLa", "y" : 2 , N : "GG"},{ "T": "HeLa", "y" : 14 , N : "GG"},{ "T": "HeLa" , "y" : 4, N : "PP"}, { "T": "HeLa" , "y" : 1,  N : "PP"}, { "T": "HEK" , "y" : 2,  N : "PP"},{ "T": "HEK", "y" : 6, N : "GG"},{ "T": "HEK", "y" : 4, N : "GG"},{ "T": "Macrophages", "y" : 16 , N : "GG"} ,{ "T": "HeLa", "y" : 2 , N : "GG"},{ "T": "HeLa", "y" : 14 , N : "GG"},{ "T": "HeLa" , "y" : 4, N : "PP"}, { "T": "HeLa" , "y" : 1,  N : "PP"}, { "T": "HEK" , "y" : 2,  N : "PP"}]
    // const { data, isLoading, isError, error } = useGetDatasetMitoLoc()
    // if (isError) return <APIError error={error} />
    // if (isLoading) return <Loading />
    // console.log(data)
    // return (
    //     <div>
            
    //         {_.isObject(data) ? <CollapsableScatter width={1300} {...data} tooltipNames={["Key","GeneNames","x","s"]} sizeName={"y"}/>:null}
    //     </div>
    // )


   return(<h2>Post translational modifications</h2>)
}

export default PTM