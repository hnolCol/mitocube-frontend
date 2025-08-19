import { SegmentedControl } from "@blueprintjs/core";
import hooks from "@mitocube/api-hooks";
import PropTypes from "prop-types";
import _ from "lodash";

export function MaintenanceEventState({ maintenance_event_tag }) {
    
    const { mutate : changeEventState } = hooks.maintenance.usePostMaintenanceEventState()
    const { data } = hooks.maintenance.states.useGetMaintenanceEventStates({}, {  })
    const { data: maintenance_event_states } = hooks.maintenance.useGetMaintenanceEventState({maintenance_event_tag}, { enabled: !!maintenance_event_tag })
    console.log(data, maintenance_event_states)

    const handleStateChange = (event_state_tag) => { 

            changeEventState({ maintenance_event_tag, event_state_tag }, {
                onSuccess: () => {
                    console.log("State changed successfully")
                },
                onError: (error) => {
                    console.error("Error changing state", error)
                }
            })  
    }

    return (
        <div>
            {_.isArray(data) ? data.map(meState => {
                return <button onClick={(() => handleStateChange(meState.tag))}>{meState.tag}</button>
            }) : null}
        </div>
    )


}