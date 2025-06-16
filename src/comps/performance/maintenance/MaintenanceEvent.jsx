import hooks from "@mitocube/api-hooks"
import { useState } from "react"
import { SymptomInput } from "../../core/input/api/SymptomInput"




export function MaintenanceEventDefinition({ }) {
        
    const [me, setMaintenanceEvent] = useState({}) //me = MaintenanceEvent 

    return <div>
        <h3>Maintenance event</h3>
        
        <div> 

            <div>
                A maintenance event defines the symptom/issue for a one or multiple instruments.
                Symptoms should be defined on standardized sample and should not be attributed to sample preparation.
                It may not directly possible to pinpoint the issue to a specific instrument since they might be connected.
            </div>
            
            <SymptomInput />
            

        </div>
    
        



    </div>


}