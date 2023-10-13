import { Outlet, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useGetDatasetInfo } from "../../hooks/queries/datasets.hooks";
import { useState } from "react";



function DatasetHeader({token = "43453asda"}) {
    const params = useParams()
    const dataID = params.dataID
    const urlStart = `/dataset/${dataID}`
    const [tabHeader, setTabHeader] = useState("")
    const {data : datasetInfo, isLoading, isFetching, isError, error, isFetched} = useGetDatasetInfo({token, dataID})
    
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
            
            <Outlet context={{datasetInfo, isLoading, isFetching, isError, error, dataID, isFetched, setTabHeader, token}}/>
           
            
        </div>
    )
}

export default DatasetHeader