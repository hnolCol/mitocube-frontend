import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { SymptomsInput } from "../../core/input/api/SymptomInput"
import { InstrumentStateInput } from "../../core/input/api/InstrumentStateInput"
import { TextArea, Dialog, Button } from "@blueprintjs/core"
import _ from "lodash"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import { api } from "@/api"

const INVALIDATE_KEYS = [
    "getQueryMaintenanceEvents",
    "getMaintenanceEventCount",
    "getMaintenanceCosts",
    "getStatesOfAnInstrument",
    "getInstrumentsOverview",
]

const emptyEvent = (instrument_tag) => ({
    description: "",
    instrument_state_tag: undefined,
    instrument_tag,
    symptom_tags: [],
})

export function InsertMaintenanceEvent({ instrument_tag, refetch }) {
    const [isOpen, setIsOpen] = useState(false)
    const [me, setMaintenanceEvent] = useState(emptyEvent(instrument_tag)) // me = MaintenanceEvent
    const queryClient = useQueryClient()

    const { data: instrument } = api.instruments.core.useGetInstrument({ tag: instrument_tag }, { enabled: !!instrument_tag, staleTime: Infinity })
    const { isLoading, mutate: submit } = api.maintenance.core.usePostMaintenanceEvent({ ...me }, { enabled: false })

    useEffect(() => {
        setMaintenanceEvent(prev => ({ ...prev, instrument_tag }))
    }, [instrument_tag])

    const isValid = () =>
        _.isString(me.description) && me.description.length > 0 &&
        _.isString(me.instrument_state_tag) && me.instrument_state_tag.length > 0 &&
        _.isString(me.instrument_tag) && me.instrument_tag.length > 0

    const handleSubmit = () => {
        if (!isValid()) return
        submit(me, {
            onSuccess: () => {
                setMaintenanceEvent(emptyEvent(instrument_tag))
                setIsOpen(false)
                INVALIDATE_KEYS.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))
                if (_.isFunction(refetch)) refetch()
            },
            onError: (error) => console.error("Error creating maintenance event", error)
        })
    }

    const sectionTitle = { margin: "1.25rem 0 0.25rem", fontSize: "0.95rem", fontWeight: 600 }
    const hint = { color: "#5c7080", fontSize: "0.85rem", marginBottom: "0.5rem" }

    return (
        <>
            <Button icon="add" intent="primary" onClick={() => setIsOpen(true)}>
                New maintenance event
            </Button>

            <Dialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={`New maintenance event${instrument?.text ? ` · ${instrument.text}` : ""}`}
                style={{ width: "min(600px, 85vw)" }}
                canOutsideClickClose={false}
            >
                <div className="bp5-dialog-body" style={{ maxHeight: "min(70vh, 900px)", overflowY: "auto", padding: "0.5rem 1.25rem" }}>
                    <div style={hint}>
                        A maintenance event defines the symptom/issue for one or multiple instruments.
                        Symptoms should be defined on standardized samples and not attributed to sample preparation.
                        It may not be possible to pinpoint the issue to a specific instrument since they might be connected.
                    </div>

                    <div style={sectionTitle}>Description</div>
                    <div style={hint}>Describe what happened and any context that helps others understand the event.</div>
                    <TextArea
                        value={me.description}
                        fill
                        rows={4}
                        onChange={(e) => setMaintenanceEvent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Add a description/details for the maintenance event..."
                    />

                    <div style={sectionTitle}>Instrument state</div>
                    <div style={hint}>Update the instrument state to reflect its current status.</div>
                    <InstrumentStateInput
                        selectedItems={[me.instrument_state_tag]}
                        onItemSelect={(instrument_state_tag) => setMaintenanceEvent(prev => ({ ...prev, instrument_state_tag }))}
                    />

                    <div style={sectionTitle}>Symptoms</div>
                    <div style={hint}>Pick the symptoms that best describe the problem.</div>
                    <SymptomsInput
                        selectedItems={me.symptom_tags}
                        onItemSelect={(symptom_tag) => setMaintenanceEvent(prev => ({
                            ...prev,
                            symptom_tags: addStringToArrayOrRemove({ array: prev.symptom_tags ?? [], string: symptom_tag }),
                        }))}
                    />
                </div>

                <div className="bp5-dialog-footer">
                    <div className="bp5-dialog-footer-actions">
                        <Button minimal onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button intent="primary" onClick={handleSubmit} disabled={isLoading || !isValid()}>
                            {isLoading ? "Submitting..." : "Create event"}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    )
}


