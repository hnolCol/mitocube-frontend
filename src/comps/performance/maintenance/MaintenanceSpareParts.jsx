import { Tooltip } from "@blueprintjs/core"
import _ from "lodash"
import PropTypes from "prop-types"
import hooks from "@mitocube/api-hooks"
import { SparePartInput } from "../../core/input/api/SparePartInput"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"
import { IncreaseButton, ReduceButton } from "../../core/base/buttons/ReduceButton"
import { api } from "@/api"



MaintenanceSparePart.propTypes = {
    tag: PropTypes.string.isRequired,
    onSparePartChange: PropTypes.func.isRequired,
    maintenance_event_tag: PropTypes.string.isRequired
}   


/**
 * 
 * @param {*} props 
 * @param {String} props.tag The tag of the spare part to be displayed
 * @param {Function} props.onRemove Function to be called when the spare part is removed
 * @description Component to display a single spare part used in a maintenance event.
 * It fetches the spare part details using the tag and displays it.
 * It also allows the user to remove the spare part from the maintenance event.
 * @returns 
 */
export function MaintenanceSparePart({ tag, onSparePartChange, maintenance_event_tag }) {
   
    const { data: sparepart, isSuccess } = api.maintenance.spareparts.querySpareParts.useGetSparePartByTag({ tag })
    const { data: count, refetch : refetchCount } = hooks.maintenance.useGetSparePartCountByMaintenanceEvent({ maintenance_event_tag, sparepart_tag: tag })
    
    const handleChange = (force_increase = false, force_decrease = false) => {
        onSparePartChange(tag, force_increase, force_decrease, refetchCount)
    }

    return <div>
        {isSuccess ?
            <Tooltip content={<div>{sparepart.description}</div>}>
                <div className="flex margin--little padding--little bg--grey">
                    
                    <div className="flex padding--little">
                        <div className="">{sparepart.text} (<strong>{sparepart.product_id}</strong>)</div>
                        <div className="flex">
                            <div><ReduceButton onReduce={() => handleChange(false,true)} /></div>
                            <div><strong>{count}</strong></div>
                            <div><IncreaseButton onIncrease={() => handleChange(true, false)} /></div>
                        </div>
                    
                    </div>
                    </div>
            </Tooltip> : null}
    </div>
}


MaintenanceSpareParts.propTypes = {
    maintenance_event: PropTypes.object.isRequired,
    refetch: PropTypes.func.isRequired
}

export function MaintenanceSpareParts({ maintenance_event, refetch, refetchCosts }) {

    const maintenance_event_tag = maintenance_event.tag
    const { mutate: deleteSparePart } = hooks.maintenance.useDeleteSparePartToMaintenanceEvent()
    const { mutate: addSparePart } = hooks.maintenance.usePostSparePartToMaintenanceEvent()
    /**
     * 
     * @param {String} sparepart_tag 
     * @param {Boolean} force_increase 
     * @param {Boolean} force_decrease 
     * @param {Function} onSuccessFunc Function to be called on success of the operation
     * @description Handles the spare part selection. If the spare part is already selected, it will be removed from the list.
     * If it is not selected, it will be added to the list.
     * On Success, it will refetch the maintenance event to update the UI.
     */
    const handleSparePartSelect = (sparepart_tag, force_increase = false, force_decrease = false, onSuccessFunc) => {
        console.log(onSuccessFunc, "???", "onSUccessFunc")
        const isFunction = _.isFunction(onSuccessFunc)
        if ((force_decrease || _.includes(maintenance_event.sparepart_tags, sparepart_tag)) && !force_increase) {
            // remove the spare part tag from the list
            deleteSparePart({ maintenance_event_tag, sparepart_tag }, {
                onSuccess: () => {
                    if (isFunction) {
                        onSuccessFunc()
                    }
                    refetch()
                    if (refetchCosts) refetchCosts()
                    
                },
                onError: (error) => {
                    console.error("Error removing spare part from maintenance event", error)
                }
            })
        } else {
            // add the spare part tag to the list
            addSparePart({ maintenance_event_tag, sparepart_tag }, {
                onSuccess: () => {
                    if (isFunction) {
                        onSuccessFunc()
                    }
                    refetch()
                    if (refetchCosts) refetchCosts()
                    
                }
            })
        }
    }

    return <div className="flex">
        <div className="flex-column">
        <div className="flex center-items"><div>Spare Parts</div>
            {maintenance_event.sparepart_tags ?
            <SparePartInput selectedItems={maintenance_event.sparepart_tags} onItemSelect={sparepart_tag => handleSparePartSelect(sparepart_tag)} />
                    : null}
            </div>
            <div className="flex">
                {_.isArray(maintenance_event.sparepart_tags) && maintenance_event.sparepart_tags.length > 0 ?
                    maintenance_event.sparepart_tags.map((sparepart_tag, idx) =>
                        <MaintenanceSparePart key={`${idx}-${sparepart_tag}`}
                            tag={sparepart_tag}
                            onSparePartChange={handleSparePartSelect}
                            maintenance_event_tag={maintenance_event_tag} />)
                    : null}
            </div>
        </div>
        
    </div>
}