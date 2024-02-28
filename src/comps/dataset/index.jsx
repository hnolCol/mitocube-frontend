import { Outlet, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useGetMetadata } from "../../hooks/queries/datasets.hooks";
import { useState } from "react";
import Loading from "../core/base/loading";
import { useGetSubmissionAttributesByTag, useGetSubmissionStates } from "../../hooks/queries/submission.hooks";



function DatasetHeader({authenticationStatus}) {
    const params = useParams()
    const dataset_label = params.dataID
    const urlStart = `/datasets/${dataset_label}`
    const [tabHeader, setTabHeader] = useState("")
    
    // const {data : datasetInfo, isLoading, isFetching, isError, error, isFetched} = useGetDatasetInfo({token, dataID})
    const {data : metadata, isLoading : metadataIsLoading, isFetching : metadataIsFetching, refetch : refetchMetaData} = useGetMetadata({dataset_label})
    const {data : attributesByTag, isLoading : attrIsLoading, isFetching : attrIsFetching} = useGetSubmissionAttributesByTag({tokenString : authenticationStatus.token},{staleTime : Infinity})
    const { data: submissionStates, isLoading: submissionStatesLoading } = useGetSubmissionStates()
    
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
                    { text: "Runlist", to: `${urlStart}/runlist` },
                    { text: "Help", to : `${urlStart}/help`}]} />   
            {/* context={{datasetInfo, isLoading, isFetching, isError, error, dataID, isFetched, setTabHeader, token}} */}
            {metadataIsFetching || metadataIsLoading || attrIsLoading || attrIsFetching || submissionStatesLoading? <Loading /> : null}
            <div className="no-scroll div--expand">
            <Outlet context={{dataset_label, metadata,refetchMetaData, tabHeader, setTabHeader,attributesByTag,submissionStates}}/>
            </div>
            
        </div>
    )
}

export default DatasetHeader