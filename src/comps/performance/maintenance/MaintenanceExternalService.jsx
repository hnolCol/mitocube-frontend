import { useState } from "react"
import PropTypes from "prop-types"
import { Button } from "@blueprintjs/core"
import _ from "lodash"
import { api } from "@/api"
import { AddExternalServiceDialog } from "../../admin/externalservice/AddExternalServiceDialog"
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

function ExternalService({ tag, onRemove }) {
    const { data: service, isSuccess } =
        api.maintenance.externalservice.queryExternalService.useGetExternalServiceByTag({ tag })

    if (!isSuccess) return null

    return (
        <div className="flex center-items margin--little padding--little bg--grey div--round" style={{ gap: "0.75rem" }}>
            <div>
                <div>{service.description}</div>
                <strong>{_.has(service, "costs") && service.costs > 0 ? `${service.costs} €` : "n/a"}</strong>
            </div>
            <RemoveButton onRemove={() => onRemove(tag)} />
        </div>
    )
}

export function MaintenanceExternalServices({ maintenance_event, refetch, refetchCosts }) {
    const [isDialogOpen, setDialogOpen] = useState(false)

    const { mutate: addExternalService } = api.maintenance.core.usePostExternalServiceToMaintenanceEvent()
    const { mutate: deleteExternalService } = api.maintenance.core.useDeleteExternalServiceFromMaintenanceEvent()

    const afterChange = () => {
        refetch()
        if (_.isFunction(refetchCosts)) refetchCosts()
    }

    const handleRemoveService = (external_service_tag) => {
        deleteExternalService(
            { maintenance_event_tag: maintenance_event.tag, external_service_tag },
            {
                onSuccess: afterChange,
                onError: (err) => console.error("Error removing external service", err),
            }
        )
    }

    const handleServiceCreated = (external_service_tag) => {
        addExternalService(
            { maintenance_event_tag: maintenance_event.tag, external_service_tag },
            {
                onSuccess: () => {
                    setDialogOpen(false)
                    afterChange()
                },
                onError: (err) => console.error("Error linking external service", err),
            }
        )
    }

    return (
        <div className="flex flex-column">
            <SectionHeader action={<Button icon="plus" small minimal intent="primary" onClick={() => setDialogOpen(true)} />}>
                External services
            </SectionHeader>

            <div className="flex" style={{ flexWrap: "wrap" }}>
                {maintenance_event.external_service_tag?.map((tag) => (
                    <ExternalService key={tag} tag={tag} onRemove={handleRemoveService} />
                ))}
            </div>

            <AddExternalServiceDialog
                isOpen={isDialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={handleServiceCreated}  
            />
        </div>
    )
}

MaintenanceExternalServices.propTypes = {
    maintenance_event: PropTypes.object.isRequired,
    refetch: PropTypes.func.isRequired,
    refetchCosts: PropTypes.func
}