import { useState } from "react"
import PropTypes from "prop-types"
import { Button } from "@blueprintjs/core"
import { api } from "@/api"
import { Trait } from "../../core/base/traits/Trait"
import { AddExternalServiceDialog } from "../../admin/externalservice/AddExternalServiceDialog"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"
import _ from "lodash"

function ExternalService({ tag, onRemove }) {
    const { data: service, isSuccess } =
        api.maintenance.externalservice.queryExternalService.useGetExternalServiceByTag({ tag })

    if (!isSuccess) return null

    return (
        <div
            className="flex margin--little padding--little bg--grey center-items"
            style={{ justifyContent: "space-between" }}
        >
            <div>
                <div>{service.description}</div>
                <div>{_.has(service, "costs") && service.costs > 0 ? <strong>{service.costs} €</strong> : "na" }</div>
                <div className="font-size--small text--muted">
                </div>
            </div>

            <RemoveButton onRemove={() => onRemove(tag)} />
        </div>
    )
}


export function MaintenanceExternalServices({ maintenance_event, refetch, refetchCosts }) {
    const [isDialogOpen, setDialogOpen] = useState(false)

    const { mutate: addExternalService } =
        api.maintenance.core.usePostExternalServiceToMaintenanceEvent()

    const { mutate: deleteExternalService } =
        api.maintenance.core.useDeleteExternalServiceFromMaintenanceEvent()
    
    
    const handleRemoveService = (external_service_tag) => {
            deleteExternalService(
                {
                    maintenance_event_tag: maintenance_event.tag,
                    external_service_tag,
                },
                {
                    onSuccess: () => {
                        refetch()
                        if (refetchCosts) refetchCosts()
                    },
                    onError: (err) => {
                        console.error("REMOVE FAILED", err)
                    },
                }
            )
        }
        
    const handleServiceCreated = (external_service_tag) => {
        console.log("LINKING ES TO ME:", {
            maintenance_event_tag: maintenance_event.tag,
            external_service_tag: external_service_tag,
        })


        addExternalService(
            {
                maintenance_event_tag: maintenance_event.tag,
                external_service_tag: external_service_tag,
            },
            {
                onSuccess: () => {
                    setDialogOpen(false)
                    refetch()
                    if (refetchCosts) refetchCosts()
                },
            
                onError: (err) => {
                    console.error("LINK FAILED", err)
                },
            }
        )
    }
    

    return (
        <div className="flex flex-column">
            <div className="flex center-items">
                <div>External Services</div>
                <Button
                    icon="plus"
                    minimal
                    intent="primary"
                    onClick={() => setDialogOpen(true)}
                />
            </div>

            {maintenance_event.external_service_tag?.map((tag) => (
            <ExternalService
                key={tag}
                tag={tag}
                onRemove={handleRemoveService}
            />
        ))}



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


