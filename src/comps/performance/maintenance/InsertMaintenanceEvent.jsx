import hooks from "@mitocube/api-hooks"
import { useEffect, useState } from "react"
import { SymptomsInput } from "../../core/input/api/SymptomInput"
import { InstrumentStateInput } from "../../core/input/api/InstrumentStateInput"
import { TextArea } from "@blueprintjs/core"
import _ from "lodash"
import {addStringToArrayOrRemove} from "../../../services/arrays/transforms"
import { Dialog, Button } from "@blueprintjs/core"




export function InsertMaintenanceEvent({instrument_tag}) {

    const [isOpen, setIsOpen] = useState(false)
        
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
    
return (
    <>
    <div style={{ position: "fixed", top: "72px", right: "24px", zIndex: 1000 }}>
    <Button icon="add" onClick={() => setIsOpen(true)}>
        Create Maintenance Event
    </Button>
</div>



        <Dialog
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={`Create Maintenance event for ${instrument?.text ?? ""}`}
            style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }} 
            canOutsideClickClose={false}
        >
            <div className="bp5-dialog-body">

                <div>
                    A maintenance event defines the symptom/issue for a one or multiple instruments.
                    Symptoms should be defined on standardized sample and should not be attributed to sample preparation.
                    It may not directly possible to pinpoint the issue to a specific instrument since they might be connected.
                </div>
                
                <span></span>
                <h4>Description</h4>
                <div>
                    Provide a description of the maintenance event.
                    This is not mandatory but helps to understand the context of the event.
                </div>

                <TextArea
                    value={me.description}
                    fill
                    onChange={(e) =>
                        setMaintenanceEvent(prev => ({
                            ...prev,
                            description: e.target.value,
                        }))
                    }
                    placeholder="Add a description/details for the maintenance event..."
                />

                <h4>Instrument State</h4>
                <div>
                    Please update the instrument state to reflect the current status of the instrument.
                </div>

                <InstrumentStateInput
                    selectedItems={[me.instrument_state_tag]}
                    onItemSelect={(instrument_state_tag) =>
                        setMaintenanceEvent(prev => ({
                            ...prev,
                            instrument_state_tag,
                        }))
                    }
                />

                <h4>Symptom</h4>
                <div>
                    Pick the symptom that describes best your instrument problem.
                </div>

                <SymptomsInput
                    selectedItems={me.symptom_tags}
                    onItemSelect={(symptom_tag) =>
                        setMaintenanceEvent(prev => ({
                            ...prev,
                            symptom_tags: addStringToArrayOrRemove({
                                array: prev.symptom_tags,
                                string: symptom_tag,
                            }),
                        }))
                    }
                />
            </div>

            <div className="bp5-dialog-footer">
                <div className="bp5-dialog-footer-actions">
                    <Button
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        style={{ backgroundColor: "#ec7160ff" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleMaintenanceEventSubmit}
                        disabled={isLoading || !checkMaintenanceEventInput()}
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </div>  
        </Dialog>
    </>
)
}