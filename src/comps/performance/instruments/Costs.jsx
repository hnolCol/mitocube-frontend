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
    const { data: costs, isSuccess } = api.maintenance.core.useGetMaintenanceCosts({ instrument_tag: tag })
    return (
        <div>
            <div style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#5c7080",
            }}>
                Maintenance costs
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, color: HIGHLIGHT_COLOR, marginTop: 2 }}>
                {isSuccess ? `${abbreviateNumber(costs)} €` : "–"}
            </div>
        </div>
    );
}