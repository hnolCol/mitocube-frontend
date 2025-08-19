import { Outlet, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useGetMetadata } from "../../hooks/queries/datasets.hooks";
import { useState } from "react";
import Loading from "../core/base/loading";
import { useGetSubmissionStates } from "../../hooks/queries/submission.hooks";
import _ from "lodash"

/**
 * @description The header for the dataset view. Loads the metadata as well as the attributes. 
 * @param {*} param0 
 * @returns 
 */
function DatasetHeader({}) {
    const params = useParams()
    const submission_tag = params.dataID
    const urlStart = `/datasets/${submission_tag}`
    const [tabHeader, setTabHeader] = useState("")
    // const {data : datasetInfo, isLoading, isFetching, isError, error, isFetched} = useGetDatasetInfo({token, dataID})
    const { data: metadata, isLoading: metadataIsLoading, isFetching: metadataIsFetching, refetch: refetchMetaData } = useGetMetadata({ tag: submission_tag}, {enabled : _.isString(submission_tag)})
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
                    { text: "Correlation", to: `${urlStart}/correlation` },
                    { text: "Runlist", to: `${urlStart}/runlist` },
                    { text: "Help", to : `${urlStart}/help`}]} />   
            {/* context={{datasetInfo, isLoading, isFetching, isError, error, dataID, isFetched, setTabHeader, token}} */}
            {metadataIsFetching || metadataIsLoading || submissionStatesLoading? <Loading /> : null}
            <div className="no-scroll div--expand">
                
            <Outlet context={{submission_tag, metadata, refetchMetaData, tabHeader, setTabHeader, submissionStates}}/>
            </div>
            
        </div>
    )
}

export default DatasetHeader