import { InsertEditProcedure } from "../../core/procedure/InsertProcedure.jsx";
import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { Dialog } from "@blueprintjs/core";

export function AddProcedureDialog({ isOpen, onClose }) { 

    return (
        <Dialog isOpen={isOpen} title="Add Procedure" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width: "95%" }}>
                    <InsertEditProcedure onClose={onClose} />
                </div>
            </div>
        </Dialog>
    );
}

export function EditProcedureDialog({ isOpen, onClose, procedure_tag }) {

    const {data: procedure, isSuccess : isProcedureSuccess} = hooks.maintenance.procedures.useGetMaintenanceProcedureByTag({ procedure_tag}, { enabled : _.isString(procedure_tag) && isOpen})    
  

    return (
        <Dialog  isOpen={isOpen} title="Edit Procedure" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium" style={{ height: "95%" }}>
                <div style={{ height: "100%", width: "95%" }}>
                    {isProcedureSuccess ? (
                        <InsertEditProcedure
                            isEditing={true}
                            procedure_tag={procedure_tag} 
                            preText={procedure.text}
                            preDescription={procedure.description}
                            prepriority={procedure.priority}
                            onClose={onClose}
                        />
                    ) : null}
                </div>
            </div>
        </Dialog>
    );
}

