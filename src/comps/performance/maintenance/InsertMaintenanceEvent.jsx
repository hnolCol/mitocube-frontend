import hooks from "@mitocube/api-hooks"
import { useEffect, useState } from "react"
import { SymptomsInput } from "../../core/input/api/SymptomInput"
import { InstrumentStateInput } from "../../core/input/api/InstrumentStateInput"
import { TextArea } from "@blueprintjs/core"
import _ from "lodash"
import {addStringToArrayOrRemove} from "../../../services/arrays/transforms"




export function InsertMaintenanceEvent({instrument_tag}) {
        
    const [me, setMaintenanceEvent] = useState({description : "", instrument_state_tag : undefined, instrument_tag : instrument_tag, symptom_tags : []}) //me = MaintenanceEvent 
    const { data: instrument, isSuccess } = hooks.instruments.useGetInstrument({ tag: instrument_tag }, { enabled: !!instrument_tag, stateTime: "Infinity" })    
    
    const { isLoading, mutate : submit} = hooks.maintenance.usePostMaintenanceEvent({...me}, {enabled : false})

    useEffect(() => {
        setMaintenanceEvent(prevValues => {
            return { ...prevValues, instrument_tag }
        })
    }, [instrument_tag])
    
    const checkMaintenanceEventInput = () => {
        if (_.isString(me.description) && me.description.length > 0 &&
            _.isString(me.instrument_state_tag) && me.instrument_state_tag.length > 0 &&
            _.isString(me.instrument_tag) && me.instrument_tag.length > 0) {
            return true
        }
        return false
    }

    const handleMaintenanceEventSubmit = () => {
        if (checkMaintenanceEventInput()) {
            submit(me, {
                onSuccess: (data) => {
                    console.log("Maintenance event created successfully", data)
                    setMaintenanceEvent({description : "", instrument_state_tag : undefined, instrument_tag : instrument_tag}) // reset form
                },
                onError: (error) => {
                    console.error("Error creating maintenance event", error)
                }
            })
            } 
    }

    return <div>
        <h3>Create Maintenance event for {instrument.text}</h3>

            <div>
                A maintenance event defines the symptom/issue for a one or multiple instruments.
                Symptoms should be defined on standardized sample and should not be attributed to sample preparation.
                It may not directly possible to pinpoint the issue to a specific instrument since they might be connected.
            </div>
        <h4>Description</h4>
        <div className="font-size--small">
            Please provide a description of the maintenance event.
            This is not mandatory but helps to understand the context of the event.
        </div>
        <TextArea
            value={me.description}
            fill={true}
            onChange={(e) => setMaintenanceEvent(prevValues => { return { ...prevValues, description: e.target.value } })}
            placeholder="Add a description/details for the maintenance event..." />
        
        <h4>Update Instrument State</h4>
        <div className="font-size--small">
            Please update the instrument state to reflect the current status of the instrument.
            This is important for tracking the performance and issues of the instrument.
        </div>


        <h3>Instrument State</h3>
        <InstrumentStateInput
            selectedItems={[me.instrument_state_tag]}
            onItemSelect={instrument_state_tag => setMaintenanceEvent(prevValues => { return { ...prevValues, instrument_state_tag } })} />
        
        <h3>Symptom</h3>    
        <div>Pick the symptom that describes best your instrument problem.</div> 
        <SymptomsInput
            selectedItems={me.symptom_tags}
            onItemSelect={(symptom_tag) => {
                setMaintenanceEvent(prevValues =>
                {
                    return {
                        ...prevValues,
                        symptom_tags: addStringToArrayOrRemove({ array: prevValues.symptom_tags, string: symptom_tag })
                    }
                })
            }} />
        
        <button onClick={handleMaintenanceEventSubmit} disabled={isLoading || !checkMaintenanceEventInput()}>Submit</button>

        <div> 
        </div>
    
        



    </div>


}
