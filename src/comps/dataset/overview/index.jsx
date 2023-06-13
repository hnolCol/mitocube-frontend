import { useParams } from "react-router";
import MultipleMetrices from "../../core/metrics/collection";

function DatasetOverview({ }) {
    const params = useParams()

    return (
        <div>
            <MultipleMetrices metrices={[{ label: "Proteins", metric: 7249 }, { label: "Groupings", metric: 3 }, { label: "Replicates", metric: 5 }, { label: "Material", metric: "HeLa" }]}/>
        
            <p>Experimental Procedure</p>
        
        </div>
    )
}


export default DatasetOverview