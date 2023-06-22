import PropTypes from "prop-types"
import Categorical from "../../core/metrics/Categorical"
import { Header } from "../../core/base/Header"
import ElectrosrayPerformanceIcon from "../../core/svg/icons/performance/ElectroSpray"
import PercentageLine from "../../core/charts/percentage/line"
import Heatmap from "../../core/charts/heatmap"
import Maintenance from "../../core/svg/icons/performance/Maintenance"
import QualityControl from "../../core/svg/icons/performance/QualityControl"
import { useQuery } from "react-query"
import axios from "axios"
import { useGetDendro } from "../../../hooks/queries/heatmap.hooks"
import Example from "../../core/charts/dendrogram"
import _ from "lodash"

function System({items = [{label : "Liquid Chromatography", metric : "nanoLC 1200 #2323"}, {label : "Column", metric : "Aurora Column"},{label : "Mass spectrometer", metric : "Exploris 480 #1"}]}) {
    
    return (
        <div className="flex flex-column bg--lightgrey">
        <Header text="LC-MS/MS System #1" fontWeight={900}/>
        <div className="flex flex-column center-items">
            <div className="flex">
            {items.map((item, idx) =>
                <div className="flex center-items bg--grey padding--medium">
                    <Categorical {...item} spanClassName={`h${idx}-span`} />
                    {idx < items.length - 1 ? <div style={{ width: "75px" }}><hr></hr></div> : null}
                </div>)}
                </div>
            </div>
            <h3>Status</h3>
            <ElectrosrayPerformanceIcon />
        </div>
    )
}


PerformanceOverview.propTypes = {

}


function PerformanceOverview({ }) {

    const { data, isLoading } = useGetDendro()
    console.log(data)
    return (
        <div>
            {_.isObject(data) ? <Example data={data["lines"]} width={500} height={600} /> : null}
            <Maintenance />
            <QualityControl />
            <Heatmap />
            <PercentageLine />
            <System />
        </div>
       
    )
}


export default PerformanceOverview
