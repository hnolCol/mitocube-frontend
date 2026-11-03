import { InsertEditSymptom } from "../../core/symptoms/InsertSymptoms";
import { api } from "@/api";
import _ from "lodash";
import { Dialog } from "@blueprintjs/core";

export function AddSymptomDialog({ isOpen, onClose }) { 

    return (
        <Dialog isOpen={isOpen} title="Add Symptom" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(55vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium height--nearly-full">
                <div className="height--full-width--most">
                    <InsertEditSymptom onClose={onClose} />
                </div>
            </div>
        </Dialog>
    );
}

export function EditSymptomDialog({ isOpen, onClose, tag }) {

    const {data: symptom, isSuccess : isSymptomSuccess} = api.maintenance.symptoms.querySymptoms.useGetSymptomByTag({tag : tag}, { enabled : _.isString(tag) && isOpen})    
    
    return (
        <Dialog  isOpen={isOpen} title="Edit Symptom" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(55vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium height--nearly-full">
                <div className="height--full-width--most">
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

