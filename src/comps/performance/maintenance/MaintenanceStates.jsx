import { Dialog } from "@blueprintjs/core"
import PropTypes from "prop-types"
import _ from "lodash"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { OptionButton } from "../../core/base/buttons/OptionButton"
import { InstrumentStateInput } from "../../core/input/api/InstrumentStateInput"
import { api } from "@/api"

const OPEN_STATE = "state.maintenance.open"

const INVALIDATE_KEYS = [
    // instrument state
    "getStatesOfAnInstrument",
    "getInstrumentsOverview",
    "getInstrumentStateDurations",
    "getFractionalInstrumentStateDurations",
    "getInstrumentStateDurationSummary",
    "getInstrumentPastSubmissions",
    "getSubmissionState",
    // maintenance event state
    "getMaintenanceEventState",
    "getQueryMaintenanceEvents",
    "getMaintenanceEventByTag",
]

MaintenanceEventState.propTypes = {
    maintenance_event_tag: PropTypes.string.isRequired,
    instrument_tag: PropTypes.string,
    onEventChange: PropTypes.func
}

export function MaintenanceEventState({ maintenance_event_tag, instrument_tag, onEventChange }) {
    const [instrumentStateDialog, setInstrumentStateDialog] = useState({ isOpen: false, me_state_tag: null })
    const queryClient = useQueryClient()

    const { mutate: changeEventState } = api.maintenance.core.usePostMaintenanceEventState()
    const { data } = api.maintenance.states.useGetMaintenanceEventStates({}, {})
    const { data: maintenance_event_state } = api.maintenance.core.useGetMaintenanceEventState(
        { maintenance_event_tag },
        { enabled: !!maintenance_event_tag }
    )
    const { mutate: updateInstrumentState } = api.instruments.core.usePostInstrumentState()
    const { data: allInstrumentStates } = api.instruments.core.useGetAllInstrumentStates()

    const currentEventState = maintenance_event_state?.tag ?? maintenance_event_state
    const runningTag = _.isArray(allInstrumentStates)
        ? allInstrumentStates.find(s => s.text?.toLowerCase() === "running")?.tag
        : undefined

    const refreshAll = () => {
        INVALIDATE_KEYS.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))
        if (_.isFunction(onEventChange)) onEventChange()
    }

    const handleStateChange = (event_state_tag, instrument_state_tag) => {
        if (event_state_tag === OPEN_STATE && instrument_state_tag === runningTag) {
            console.warn("Cannot set instrument to running while the maintenance event is open")
            return
        }

        changeEventState({ maintenance_event_tag, event_state_tag }, {
            onSuccess: () => {
                updateInstrumentState({ tag: instrument_tag, instrument_state_tag }, {
                    onSuccess: refreshAll,
                    onError: (error) => {
                        console.error("Error changing instrument state", error)
                        refreshAll()
                    }
                })
                setInstrumentStateDialog({ isOpen: false, me_state_tag: null })
            },
            onError: (error) => console.error("Error changing event state", error)
        })
    }

    const handleCloseDialog = () => {
        setInstrumentStateDialog({ isOpen: false, me_state_tag: null })
    }

    return (
        <div>
            <Dialog title="Instrument State" isOpen={instrumentStateDialog.isOpen} style={{ minWidth: "800px" }} onClose={handleCloseDialog}>
                <div className="flex flex-column padding--medium margin--medium">
                    <div>Select the updated instrument state.</div>
                    <InstrumentStateInput
                        selectedItems={[]}
                        onItemSelect={(instrument_state_tag) => handleStateChange(instrumentStateDialog.me_state_tag, instrument_state_tag)}
                    />
                </div>
            </Dialog>
            {_.isArray(data) && data.length > 0 ? data.map(meState => (
                <OptionButton
                    key={meState.tag}
                    isSelected={meState.tag === currentEventState}
                    onClick={() => {
                        if (meState.tag === currentEventState) return
                        setInstrumentStateDialog({ isOpen: true, me_state_tag: meState.tag })
                    }}
                >
                    <span>{meState.text}</span>
                </OptionButton>
            )) : null}
        </div>
    )
}