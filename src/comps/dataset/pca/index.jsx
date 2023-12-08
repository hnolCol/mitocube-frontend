import { useOutletContext } from "react-router";
import APIError from "../../core/error/APIerror";
import { Header } from "../../core/base/Header";
import { useEffect } from "react";
import { useGetDatasetPCA } from "../../../hooks/queries/datasets.hooks";
import _ from "lodash"
import Loading from "../../core/base/loading";
import { isError } from "react-query";

function DatasetPCA({ }) {
    
    const { dataset_label, metadata, setTabHeader } = useOutletContext()   
    const { data, isLoading, isFetching, isError, error, isSuccess } = useGetDatasetPCA({ dataset_label })
    
    useEffect(() => {
        if (_.isObject(metadata) && _.has(metadata, "title")) {
            setTabHeader(metadata.title)
        }
        else {
            refetchMetaData()
        }
       
    }, [metadata.title])

    console.log(data, isFetching, isLoading)
    return (
        <div>
            <h2>Principal Component Analysis</h2>
            <p>Please select the desired components showing the projection (left) as well the drivers (right). Selecting a point in the right point displays the feature's profile in the bottom.</p>
            {isLoading || isFetching ? <Loading /> : isError ? <APIError error={error} /> : isSuccess ? 
                <div>
                    <p>{data.variance_explained.length} components calculated, explaining {_.round(_.sum(data.variance_explained)*10000)/100}% of the total variance.</p>
                    <div>
                        <h3>Projection</h3>
                        
                    </div>
                
                
                </div> : null}


        </div>
    )


}


export default DatasetPCA