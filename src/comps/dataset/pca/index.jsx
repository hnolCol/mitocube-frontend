import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Header } from "../../core/base/Header";
import { useEffect } from "react";


function DatasetPCA({ }) {
    
    const { dataset_label, metadata, setTabHeader } = useOutletContext()   

    useEffect(() => {
        setTabHeader(metadata.title)
    }, [])
    return (
        <div>
            <h2>Principal Component Analysis</h2>
            <p>Please select the desired components showing the projection (left) as well the drivers (right). Selecting a point in the right point displays the feature's profile in the bottom.</p>



        </div>
    )


}


export default DatasetPCA