import { SegmentedControl } from "@blueprintjs/core";
import hooks from "@mitocube/api-hooks";
import PropTypes from "prop-types";
import _ from "lodash";
import { OptionButton } from "../../core/base/buttons/OptionButton";

export function MaintenanceEventState({ maintenance_event_tag }) {
    
    const { mutate : changeEventState } = hooks.maintenance.usePostMaintenanceEventState()
    const { data } = hooks.maintenance.states.useGetMaintenanceEventStates({}, {  })
    const { data: maintenance_event_state, refetch : updateMaintenanceEventState } = hooks.maintenance.useGetMaintenanceEventState({maintenance_event_tag}, { enabled: !!maintenance_event_tag })

    const handleStateChange = (event_state_tag) => { 

            changeEventState({ maintenance_event_tag, event_state_tag }, {
                onSuccess: () => {
                    console.log("State changed successfully")
                    updateMaintenanceEventState()

                },
                onError: (error) => {
                    console.error("Error changing state", error)
                }
            })  
    }

    return (
        <div>
            {_.isArray(data) && data.length > 0 ? data.map(meState => {
                return <OptionButton key={meState.tag} isSelected={meState.tag === maintenance_event_state} onClick={(() => handleStateChange(meState.tag))}><span>{meState.text}</span></OptionButton>
            }) : null}
        </div>
    )


}