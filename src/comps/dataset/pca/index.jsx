import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Header } from "../../core/base/Header";


function DatasetPCA({ }) {
    
    const { datasetInfo, dataID, isLoading, isFetched, isError, error } = useOutletContext()   

    if (isError) return <APIError error={error} />
    if (isLoading) return <div>Loading...</div>

    return (
        <div>
            <Header text="Principal Component Analysis" />
            <p>Please select the desired components showing the projection (left) as well the drivers (right). Selecting a point in the right point displays the feature's profile in the bottom.</p>



        </div>
    )


}


export default DatasetPCA