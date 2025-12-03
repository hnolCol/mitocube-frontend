import { InsertEditSymptom } from "../../core/symptoms/InsertSymptoms";
import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { Dialog } from "@blueprintjs/core";

export function AddSymptomDialog({ isOpen, onClose }) { 

    return (
        <Dialog isOpen={isOpen} title="Add Symptom" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width: "95%" }}>
                    <InsertEditSymptom onClose={onClose} />
                </div>
            </div>
        </Dialog>
    );
}

export function EditSymptomDialog({ isOpen, onClose, tag }) {

    const {data: symptom, isSuccess : isSymptomSuccess} = hooks.maintenance.symptoms.useGetSymptomByTag({tag : tag}, { enabled : _.isString(tag) && isOpen})    
    
    return (
        <Dialog  isOpen={isOpen} title="Edit Symptom" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width: "95%" }}>
                    {isSymptomSuccess ? (
                        <InsertEditSymptom
                            isEditing={true}
                            tag={tag}
                            preText={symptom.text}
                            preDescription={symptom.description}
                            prepriority={symptom.priority}
                            onClose={onClose}
                        />
                    ) : null}
                </div>
            </div>
        </Dialog>
    );
}

