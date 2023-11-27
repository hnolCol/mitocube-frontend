import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Header } from "../../core/base/Header";


function DatasetPCA({ }) {
    
    const { dataset_label, metadata } = useOutletContext()   

    return (
        <div>
            <h2>Principal Component Analysis</h2>
            <p>Please select the desired components showing the projection (left) as well the drivers (right). Selecting a point in the right point displays the feature's profile in the bottom.</p>



        </div>
    )


}


export default DatasetPCA