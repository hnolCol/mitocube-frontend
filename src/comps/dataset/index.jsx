import { Outlet, useParams } from "react-router";
import Tabs from "../core/navigation/tabs";
import { useGetDatasetInfo } from "../../hooks/queries/datasets.hooks";



function DatasetHeader() {
    const params = useParams()
    const dataID = params.dataID
    const urlStart = `/dataset/${dataID}`

    const {data, isLoading, isFetching, isError, error, isFetched} = useGetDatasetInfo({token : "43453asda", dataID})

    return (
        <div>
            <Tabs tabs={[
                { text: "Overview", to: urlStart},
                { text: "Volcano", to: `${urlStart}/volcano`},
                { text: "Heatmap", to: `${urlStart}/heatmap` },
                { text: "MitoMap", to: `${urlStart}/mitomap` },
                { text: "Timeline", to: `${urlStart}/timeline` },
                { text: "Help", to : `${urlStart}/help`}]} />
            <div className="intent-margin-top">
            <Outlet context={{data, isLoading, isFetching, isError, error, dataID, isFetched}}/>
            </div>
            
        </div>
    )
}

export default DatasetHeader