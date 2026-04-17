import _ from "lodash"
import { api } from "@/api"
import { Loading } from "../../core/base/states/Loading"
import { InstrumentState } from "../instruments/StateHistory"
import { CreatedAt } from "../../core/metrics/CreatedAt";
import { Button, SegmentedControl } from "@blueprintjs/core";
import { SymptomInput } from "../../core/input/api/SymptomInput";
import PropTypes from "prop-types";
import { useState } from "react";
import { MaintenanceProcedures } from "./MaintenanceProcedures";
import { MaintenanceSpareParts } from "./MaintenanceSpareParts";
import { MaintenanceEventState } from "./MaintenanceStates";
import { OptionButton } from "../../core/base/buttons/OptionButton";
import { Trait } from "../../core/base/traits/Trait";
import { Symptom } from "./Symptom";
import { MaintenanceEventCosts } from "./MaintenanceEventCost";
import { MaintenanceExternalServices } from "./MaintenanceExternalService";
import { useEffect } from "react";

MaintenanceEventItem.propTypes = {
    maintenance_event_tag: PropTypes.string.isRequired,
    showInstrument: PropTypes.bool
}   

MaintenanceEventItem.defaultProps = {
    showInstrument: true
}   

/**
 * 
 * @param {Object} props 
 * @param {String} props.maintenance_event_tag The tag of the maintenance event to be displayed
 * @param {Boolean} props.showInstrument Whether to show the instrument tag in the maintenance event
 * @description Displays a single maintenance event item.
 * It shows the instrument state, the description, the symptoms and procedures performed.
 * It also allows to add or remove symptoms and procedures from the maintenance event. 
 * @returns 
 */
export function MaintenanceEventItem({ maintenance_event_tag, instrument_tag, showInstrument, setRefetchInstrumentStateTrigger }) {
    
    const { data: maintenance_event, isLoading, isError, refetch } = api.maintenance.core.useGetMaintenanceEventByTag({ tag: maintenance_event_tag })
    const {
        refetch: refetchCosts,
      } = api.maintenance.core.useGetMaintenanceEventCosts({
        maintenance_event_tag,
      })
      
    const { isLoading: isLoadingAddingMaintenance, mutate: addSymptom } = api.maintenance.core.usePostSymptomToMaintenanceEvent()
    const { isLoading: isLoadingDeletingMaintenance, mutate: deleteSymptom } = api.maintenance.core.useDeleteSymptomToMaintenanceEvent() 
   


    /**
     * 
     * @param {String} symptom_tag The symptom to be added or removed
     * @description Handles the symptom selection. If the symptom is already selected, it will be removed from the list.
     * If it is not selected, it will be added to the list
     * On Success, it will refetch the maintenance event to update the UI.
     * @returns {void}
     */
    const handleSymptomSelect = (symptom_tag) => {

        if (_.includes(maintenance_event.symptom_tags, symptom_tag)) {
            // remove the symptom tag from the list
            deleteSymptom({ maintenance_event_tag, symptom_tag }, {
                onSuccess: () => {
                    refetch()
                },
                onError: (error) => {
                    console.error("Error removing symptom from maintenance event", error)
                }
            })
        }
         else {
            // add the symptom tag to the list
            addSymptom({ maintenance_event_tag, symptom_tag }, {
                onSuccess: () => {
                    refetch()
                }
            })
        }
    }

    

    if (isLoading) return <Loading />
    if (isError) return <div>Error loading maintenance event</div>

    return <div className="bg--lightgrey padding--medium margin--medium div--round">
        <div className="flex" style={{gap : "20px"}}>
        
        <div>
            
                {showInstrument ? <div><Trait trait_tag={maintenance_event.instrument_tag} /></div>: null}
            <CreatedAt createdat={maintenance_event.created_at} />
            <InstrumentState tag={maintenance_event.instrument_state_tag}/>
            <MaintenanceEventCosts maintenance_event_tag={maintenance_event_tag} />

        </div>
        <div >
            <h4>Description</h4>
                <p>{maintenance_event.description}</p>
                
            <div className="flex flex-column">
                <div className="flex center-items"><div>Symptoms</div>
                <SymptomInput selectedItems={maintenance_event.symptom_tags} onItemSelect={symptom_tag => handleSymptomSelect(symptom_tag)} /></div>
                {_.isArray(maintenance_event.symptom_tags) && maintenance_event.symptom_tags.length > 0 ?
                    maintenance_event.symptom_tags.map((symptom_tag, index) => {
                        return <Symptom key={`${symptom_tag}-${index}`} tag={symptom_tag} />
                    }) : null} 
                
            </div>

                <MaintenanceProcedures maintenance_event={maintenance_event} refetch={refetch} />
                <MaintenanceSpareParts maintenance_event={maintenance_event} refetch={refetch} refetchCosts={refetchCosts}/>
                <MaintenanceExternalServices maintenance_event={maintenance_event} refetch={refetch} refetchCosts={refetchCosts}/>
                <MaintenanceEventState instrument_tag={instrument_tag} maintenance_event_tag={maintenance_event_tag}  onEventChange={() => setRefetchInstrumentStateTrigger(Math.random())}/>

        </div>
        </div>
        </div>
}





MaintenanceView.propTypes = {
    instrument_tag : PropTypes.string.isRequired
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.instrument_tag The tag of the instrument for which the maintenance events should be displayed
 * @description Displays the maintenance events for a specific instrument.
 * It fetches the maintenance events for the instrument and displays them in a list. 
 * @returns 
 */
export function MaintenanceView({ instrument_tag, setRefetchInstrumentStateTrigger, onRefetchReady }) {
    const [displayRange, setDisplayRange] = useState({limit : 10 , timestamp_min : undefined, timestamp_max : undefined})
    const { data: maintenance_event_tags, isLoading, refetch } = api.maintenance.core.useGetQueryMaintenanceEvents(
            {
                instrument_tag,
                ...displayRange
            },
        { enabled: _.isString(instrument_tag) && instrument_tag.length > 0 })

        useEffect(() => {
            if (_.isFunction(onRefetchReady)) onRefetchReady(() => refetch)
        }, [])
    const { data : maintenance_total_counts } = api.maintenance.core.useGetMaintenanceEventCount({instrument_tag})
    const { data : maintenance_counts } = api.maintenance.core.useGetMaintenanceEventCount({instrument_tag, ...displayRange})

    return <div>
        {isLoading ? <Loading /> : <div>
            <div> Limit:  {[10,20,50,100].map(limit => {
                return <OptionButton  isSelected={limit === displayRange.limit} key={limit} onClick={() => setDisplayRange(prevValues => {
                    return { ...prevValues, limit }
                })}>{limit}</OptionButton>
            })}
            </div>
            <div className="font-size--small" style={{marginBottom : "10px"}}>
                Total : {maintenance_total_counts} Filtered : {maintenance_counts} for Instrument <strong><Trait trait_tag={instrument_tag}/></strong>
                </div>
            <div> 
            {_.isArray(maintenance_event_tags) && maintenance_event_tags.length > 0 ?
                maintenance_event_tags.map(me_tag => {
                    return <div key={me_tag}>
                        <MaintenanceEventItem maintenance_event_tag={me_tag} instrument_tag={instrument_tag} setRefetchInstrumentStateTrigger={setRefetchInstrumentStateTrigger} />
                    </div>
                }) : <div>No maintenance events found for this instrument.</div>}
                </div>
        </div>}
    </div>
}