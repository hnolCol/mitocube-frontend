import { Button, Card, Divider } from "@blueprintjs/core";
import _ from "lodash";
import { useState } from "react";

import { AddButton } from "../../core/base/buttons/AddButton";
import { AddSymptomDialog } from "./AddSymptomsDialog";
import hooks from "@mitocube/api-hooks";
import { SymptomsSearch } from "./SymptomsSearch"


export function SymptomCard({ symptom, refetchSymptoms, justDisplay = false, fill = false }) {
    const { mutate, isLoading } = hooks.maintenance.symptoms.useDeleteSymptom();


    if (!symptom) return null;

    return (
        <Card compact={true} interactive={true} className="margin--little" style={{ padding: "0.4rem", width: fill ? undefined : "min(350px,80vw)" }}>
            <div className="div--expand bg--grey padding--medium">
                <div className="flex center-items justify-space-between"><h4>{symptom.text}</h4>
                    {!justDisplay ? <Button
                            icon="trash"
                            small={true}
                            minimal={true}
                            intent="danger"
                            onClick={() => mutate({ tag: symptom.tag }, { onSuccess: () => refetchSymptoms() } )}
                            loading={isLoading} /> : null}
                </div>

                <Divider />

                <div className="flex flex-column" style={{ gap: "0.4rem" }}>
                    <span><strong>Description:</strong> {symptom.description}</span>
                    <span><strong>priority:</strong> {symptom.priority}</span>
                </div>
            </div>
        </Card>
    );
}


export function AdminSymptoms() {
    const [dialogProps, setDialogProps] = useState({ isOpen: false })

    return (
        <div className="div--expand padding--medium">
            <AddSymptomDialog
                isOpen={dialogProps.isOpen}
                onClose={() => setDialogProps({ isOpen: false })}
            />

            <h3>Symptoms</h3>

            <AddButton onSelect={() => setDialogProps({ isOpen: true })} />

            <SymptomsSearch />
        </div>
    )
}

