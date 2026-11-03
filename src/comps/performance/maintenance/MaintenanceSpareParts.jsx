import { Tooltip } from "@blueprintjs/core"
import _ from "lodash"
import PropTypes from "prop-types"
import { api } from "@/api"
import { SparePartInput } from "../../core/input/api/SparePartInput"
import { IncreaseButton, ReduceButton } from "../../core/base/buttons/ReduceButton"

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

MaintenanceSparePart.propTypes = {
    tag: PropTypes.string.isRequired,
    onSparePartChange: PropTypes.func.isRequired,
    maintenance_event_tag: PropTypes.string.isRequired
}

/**
 * Displays a single spare part used in a maintenance event, with +/- controls for its count.
 */
export function MaintenanceSparePart({ tag, onSparePartChange, maintenance_event_tag }) {
    const { data: sparepart, isSuccess } = api.maintenance.spareparts.querySpareParts.useGetSparePartByTag({ tag })
    const { data: count, refetch: refetchCount } = api.maintenance.core.useGetSparePartCountByMaintenanceEvent({ maintenance_event_tag, sparepart_tag: tag })

    const handleChange = (force_increase = false, force_decrease = false) => {
        onSparePartChange(tag, force_increase, force_decrease, refetchCount)
    }

    if (!isSuccess) return null

    return (
        <Tooltip content={<div>{sparepart.description}</div>}>
            <div className="flex center-items margin--little padding--little bg--grey div--round" style={{ gap: "0.5rem" }}>
                <div>{sparepart.text} (<strong>{sparepart.product_id}</strong>)</div>
                <div className="flex center-items" style={{ gap: "0.15rem" }}>
                    <ReduceButton onReduce={() => handleChange(false, true)} />
                    <strong style={{ minWidth: "1.2rem", textAlign: "center" }}>{count}</strong>
                    <IncreaseButton onIncrease={() => handleChange(true, false)} />
                </div>
            </div>
        </Tooltip>
    )
}

MaintenanceSpareParts.propTypes = {
    maintenance_event: PropTypes.object.isRequired,
    refetch: PropTypes.func.isRequired,
    refetchCosts: PropTypes.func
}

export function MaintenanceSpareParts({ maintenance_event, refetch, refetchCosts }) {
    const maintenance_event_tag = maintenance_event.tag
    const { mutate: deleteSparePart } = api.maintenance.core.useDeleteSparePartToMaintenanceEvent()
    const { mutate: addSparePart } = api.maintenance.core.usePostSparePartToMaintenanceEvent()

    /**
     * Adds a spare part, or removes one if it's already selected (unless forced).
     */
    const handleSparePartSelect = (sparepart_tag, force_increase = false, force_decrease = false, onSuccessFunc) => {
        const onSuccess = () => {
            if (_.isFunction(onSuccessFunc)) onSuccessFunc()
            refetch()
            if (_.isFunction(refetchCosts)) refetchCosts()
        }

        if ((force_decrease || _.includes(maintenance_event.sparepart_tags, sparepart_tag)) && !force_increase) {
            deleteSparePart({ maintenance_event_tag, sparepart_tag }, {
                onSuccess,
                onError: (error) => console.error("Error removing spare part from maintenance event", error)
            })
        } else {
            addSparePart({ maintenance_event_tag, sparepart_tag }, { onSuccess })
        }
    }

    return (
        <div className="flex flex-column">
            <SectionHeader action={maintenance_event.sparepart_tags ?
                <SparePartInput selectedItems={maintenance_event.sparepart_tags} onItemSelect={sparepart_tag => handleSparePartSelect(sparepart_tag)} />
                : null}>
                Spare parts
            </SectionHeader>
            <div className="flex" style={{ flexWrap: "wrap" }}>
                {_.isArray(maintenance_event.sparepart_tags) && maintenance_event.sparepart_tags.length > 0 ?
                    maintenance_event.sparepart_tags.map((sparepart_tag, idx) =>
                        <MaintenanceSparePart
                            key={`${idx}-${sparepart_tag}`}
                            tag={sparepart_tag}
                            onSparePartChange={handleSparePartSelect}
                            maintenance_event_tag={maintenance_event_tag}
                        />
                    ) : null}
            </div>
        </div>
    )
}