import { MaintenanceEventDefinition } from "../maintenance/MaintenanceEvent"
import { InstrumentMenu } from "./Menu"
import hooks from "@mitocube/api-hooks"



function PerformanceInstruments({ }) {
    
   
    // const { data, isLoading } = useGetDendro()
    
    return (
        <div>
            <InstrumentMenu />
            <MaintenanceEventDefinition />
        </div>
       
    )
}


export default PerformanceInstruments
