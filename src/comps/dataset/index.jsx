import { Outlet, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useGetMetadata } from "../../hooks/queries/datasets.hooks";
import { useState } from "react";
import Loading from "../core/base/loading";



function DatasetHeader({authenticationStatus}) {
    const params = useParams()
    const dataset_label = params.dataID
    const urlStart = `/dataset/${dataset_label}`
    const [tabHeader, setTabHeader] = useState("")
    // const {data : datasetInfo, isLoading, isFetching, isError, error, isFetched} = useGetDatasetInfo({token, dataID})
    const {data : metadata, isLoading : metadataIsLoading, isFetching : metadataIsFetching} = useGetMetadata({tokenString : authenticationStatus.token, dataset_label})

    return (
        <div className="no-scroll div--expand">
            <Tabs
                rightHeader={tabHeader}
                tabs={[
                    { text: "Overview", to: urlStart },
                    { text: "Volcano", to: `${urlStart}/volcano`},
                    { text: "Heatmap", to: `${urlStart}/heatmap` },
                    { text: "PCA", to: `${urlStart}/pca` }, 
                    { text: "MitoMap", to: `${urlStart}/mitomap` }, 
                    { text: "QC", to: `${urlStart}/qc` },
                    { text: "Timeline", to: `${urlStart}/timeline` },
                    { text: "Help", to : `${urlStart}/help`}]} />   
            {/* context={{datasetInfo, isLoading, isFetching, isError, error, dataID, isFetched, setTabHeader, token}} */}
            {metadataIsFetching || metadataIsLoading ? <Loading /> : null }
            <Outlet context={{dataset_label, metadata, tabHeader, setTabHeader}}/>
           
            
        </div>
    )
}

export default DatasetHeader