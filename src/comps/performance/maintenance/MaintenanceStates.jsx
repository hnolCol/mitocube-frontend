import { Dialog, SegmentedControl } from "@blueprintjs/core";
import hooks from "@mitocube/api-hooks";
import PropTypes from "prop-types";
import _ from "lodash";
import { OptionButton } from "../../core/base/buttons/OptionButton";
import { useState } from "react";
import { InstrumentStateInput } from "../../core/input/api/InstrumentStateInput";

export function MaintenanceEventState({ maintenance_event_tag, instrument_tag, onEventChange }) {
    const [instrumentStateDialog, setInstrumentStateDialog] =  useState({ isOpen: false, me_state_tag : null})
    const { mutate : changeEventState } = hooks.maintenance.usePostMaintenanceEventState()
    const { data } = hooks.maintenance.states.useGetMaintenanceEventStates({}, {  })
    const { data: maintenance_event_state, refetch: updateMaintenanceEventState } = hooks.maintenance.useGetMaintenanceEventState({ maintenance_event_tag }, { enabled: !!maintenance_event_tag })
    const { mutate: updateInstrumentState } = hooks.instruments.states.usePostInstrumentState()
    const handleStateChange = (event_state_tag, instrument_state_tag) => { 
            changeEventState({ maintenance_event_tag, event_state_tag }, {
                onSuccess: () => {
                    updateInstrumentState({ tag: instrument_tag, instrument_state_tag },
                        {
                            onSuccess: () => {
                                if (_.isFunction(onEventChange)) {
                        onEventChange() //call this only when instrument change is done.
                        }}  })
                    updateMaintenanceEventState()
                    
                    setInstrumentStateDialog(prevValues => ({ ...prevValues, isOpen: false }))
                },
                onError: (error) => {
                    console.error("Error changing state", error)
                }
            }) 
    }

    const handleCloseDialog = () => {
        setInstrumentStateDialog(prevValues => ({ ...prevValues, isOpen: false, me_state_tag: null }))
    }

    return (
        <div>
            
            <Dialog title="Instrument State" isOpen={instrumentStateDialog.isOpen} style={{minWidth : "800px"}} onClose={handleCloseDialog}> 
                <div className="flex flex-column padding--medium margin--medium" >
                <div>Select the updated instrument state.</div>
                    <InstrumentStateInput selectedItems={[]} onItemSelect={(instrument_state_tag) => {handleStateChange(instrumentStateDialog.me_state_tag, instrument_state_tag)}} />
                </div>
            </Dialog>
            {_.isArray(data) && data.length > 0 ? data.map(meState => {
                return <OptionButton key={meState.tag} isSelected={meState.tag === maintenance_event_state} onClick={(() => setInstrumentStateDialog(prevValues => ({ ...prevValues, me_state_tag: meState.tag, isOpen: true })))}><span>{meState.text}</span></OptionButton>
            }) : null}
        </div>
    )


}