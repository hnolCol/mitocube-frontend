import hooks from "@mitocube/api-hooks";

export function InstrumentCosts({ tag }) {
    
    const { data : costs, isLoading, isSuccess } = hooks.maintenance.costs.useGetMaintenanceCosts({ instrument_tag : tag });
    return (
        <div>
            <h2>Costs for Instrument: {tag}</h2>
            {isSuccess ? <div> Total costs: {costs} </div>:null}
        </div>
    );
}