import { api } from "@/api"
import { abbreviateNumber } from "../../../services/format/number";
import { HIGHLIGHT_COLOR } from "../../core/colors/colorPalette";



export function Costs({ amount, currency = "€" }) {
    
    return (
        <div className="bg--lightgrey padding--little div--round" style={{color : HIGHLIGHT_COLOR}}>
            <strong>{abbreviateNumber(amount)} {currency}</strong>
        </div>
    );
}


export function InstrumentCosts({ tag }) {
    
    const { data : costs, isLoading, isSuccess } = api.maintenance.core.useGetMaintenanceCosts({ instrument_tag : tag });
    return (
        <div>
            <h4>Maintenance Costs</h4>
            {isSuccess ? <div className="flex center-items"> Total costs: <Costs amount={costs} /> </div>:null}
        </div>
    );
}