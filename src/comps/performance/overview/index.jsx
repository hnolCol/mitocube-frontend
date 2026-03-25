import PropTypes from "prop-types"
import Categorical from "../../core/metrics/Categorical"
import { Header } from "../../core/base/Header"
import ElectrosrayPerformanceIcon from "../../core/svg/icons/performance/ElectroSpray"

import _ from "lodash"
import { useGetInstruments } from "../../../hooks/queries/instrument.hooks"
import { InstrumentCart } from "../../core/instruments/InstrumentCard"
import APIError from "../../core/error/APIerror"


function Instruments({ }) {

    const { data: instruments, isError, error } = useGetInstruments()    
    return (<div className="flex flex--wrap">
        {isError?<APIError error={error}/>:null}
        {_.isArray(instruments) ? instruments.map(instrument => <InstrumentCart key={instrument.tag} {...{instrument}} />):null}
    </div>)
}


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

    // const { data, isLoading } = useGetDendro()


    return (
        <div>
            {/* {_.isObject(data) ? <Example data={data["lines"]} width={500} height={600} /> : null} */}
            <h3>Instruments</h3>
            {/* <Instruments /> */}



{/* 
            <Maintenance />
            <QualityControl />
            <PercentageLine />
            <System /> */}
        </div>
       
    )
}


export default PerformanceOverview
