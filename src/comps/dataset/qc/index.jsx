import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";


function DatasetQC({ }) {
    
    const { datasetInfo, dataID, isLoading, isFetched, isError, error } = useOutletContext()   


    if (isError) return <APIError error={error} />
    if (isLoading) return <div>Loading...</div>


    return (
        <div>
            <Header text="Quality Control" />
            
        </div>
    )


}


export default DatasetQC