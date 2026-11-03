import { api } from "@/api"
import { MaintenanceProcedureInput } from "../../core/input/api/MaintenanceProcedureInput"
import _ from "lodash"
import { Tooltip } from "@blueprintjs/core"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"

function SectionHeader({ children, action }) {
    return (
        <div className="flex center-items" style={{ gap: "0.25rem", marginBottom: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#5c7080" }}>
                {children}
            </span>
            {action}
        </div>
    )
}

export function MaintenanceProcedure({ tag, onRemove }) {
    const { data: procedure, isSuccess } = api.maintenance.procedures.queryMaintenanceProcedures.useGetMaintenanceProcedureByTag({ procedure_tag: tag })
    if (!isSuccess) return null
    return (
        <Tooltip content={<div>{procedure.description}</div>}>
            <div className="flex center-items margin--little padding--little bg--grey div--round">
                <div>{procedure.text}</div>
                <RemoveButton onRemove={() => onRemove(tag)} />
            </div>
        </Tooltip>
    )
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
    const procedureTags = maintenance_event.maintenance_procedure_tags

    const { mutate: deleteProcedure } = api.maintenance.core.useDeleteMaintenanceProcedureToMaintenanceEvent()
    const { mutate: addProcedure } = api.maintenance.core.usePostMaintenanceProcedureToMaintenanceEvent()

    const handleProcedureSelect = (procedure_tag) => {
        if (_.includes(procedureTags, procedure_tag)) {
            deleteProcedure({ maintenance_event_tag, procedure_tag }, {
                onSuccess: () => refetch(),
                onError: (error) => console.error("Error removing procedure from maintenance event", error)
            })
        } else {
            addProcedure({ maintenance_event_tag, procedure_tag }, {
                onSuccess: () => refetch()
            })
        }
    }

    return (
        <div className="flex flex-column">
            <SectionHeader action={
                <MaintenanceProcedureInput selectedItems={procedureTags} onItemSelect={handleProcedureSelect} />
            }>
                Procedures
            </SectionHeader>
            <div className="flex" style={{ flexWrap: "wrap" }}>
                {_.isArray(procedureTags) && procedureTags.length > 0 ?
                    procedureTags.map((procedure_tag, idx) =>
                        <MaintenanceProcedure key={`${idx}-${procedure_tag}`} tag={procedure_tag} onRemove={handleProcedureSelect} />
                    ) : null}
            </div>
        </div>
    )
}