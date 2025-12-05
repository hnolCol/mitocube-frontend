import hooks from "@mitocube/api-hooks"
import { MaintenanceProcedureInput } from "../../core/input/api/MaintenanceProcedureInput"
import _ from "lodash"
import { Tooltip } from "@blueprintjs/core"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"

export function MaintenanceProcedure({ tag, onRemove }) {
    const { data : procedure, isSuccess } =  hooks.maintenance.procedures.useGetMaintenanceProcedureByTag({tag})
    return  <div>{isSuccess ?
        <Tooltip content={<div>{procedure.description}</div>}>
            <div className="flex margin--little padding--little bg--grey">
            <div className="">{procedure.text}</div>
                <RemoveButton onRemove={() => onRemove(tag)} />
            </div>
        </Tooltip>: null }
    </div > 
}


/**
 * 
 * @param {Object} props 
 * @param {import("@mitocube/api-hooks/src/hooks/maintenance/types").MaintenanceEvent} props.maintenance_event 
 * @param {Function} props.refetch Function to be called once the update of the procedures has finished.  
 * @returns 
 */
export function MaintenanceProcedures({ maintenance_event, refetch }) {


    const maintenance_event_tag = maintenance_event.tag

    const { mutate : deleteProcedure} = hooks.maintenance.useDeleteMaintenanceProcedureToMaintenanceEvent()
    const { mutate : addProcedure } = hooks.maintenance.usePostMaintenanceProcedureToMaintenanceEvent()
    
    /**
         * 
         * @param {String} procedure_tag The procedure to be added or removed
         * @description Handles the procedure selection. If the procedure is already selected, it will be removed from the list.
         * If it is not selected, it will be added to the list
         * On Success, it will refetch the maintenance event to update the UI.
         * @returns {void}
         */
    const handleProcedureSelect = (procedure_tag) => {

            if (_.includes(maintenance_event.maintenance_procedure_tags, procedure_tag)) {
                // remove the procedure tag from the list
                deleteProcedure({ maintenance_event_tag, procedure_tag }, {
                    onSuccess: () => {
                        refetch()
                    },
                    onError: (error) => {
                        console.error("Error removing procedure from maintenance event", error)
                    }
                })
            } else {
                // add the procedure tag to the list
                addProcedure({ maintenance_event_tag, procedure_tag }, {
                    onSuccess: () => {
                        refetch()
                    }
                })
            }
            }

    return (
        <div className="flex">
            <div className="flex-column">
                <div className="flex center-items"><div>Procedures</div>
                    <MaintenanceProcedureInput selectedItems={maintenance_event.procedure_tags} onItemSelect={procedure_tag => handleProcedureSelect(procedure_tag)} />
                    </div>
                {_.isArray(maintenance_event.maintenance_procedure_tags) && maintenance_event.maintenance_procedure_tags.length > 0 ?
                    maintenance_event.maintenance_procedure_tags.map((procedure_tag, idx) => <MaintenanceProcedure key={`${idx}-${procedure_tag}`} tag={procedure_tag} onRemove={handleProcedureSelect}/>)
                        : null}
                    </div>
            </div>

    )
}