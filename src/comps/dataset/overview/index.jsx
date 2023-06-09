import { useParams } from "react-router";

function DatasetOverview({ }) {
    const params = useParams()

    return (
        
        <div>
            <h3>Overview</h3>
            {params.dataID}
        </div>
    )
}


export default DatasetOverview