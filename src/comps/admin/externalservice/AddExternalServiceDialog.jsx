import { InsertEditExternalService } from "../../core/externalservice/InsertExternalService";
import { api } from "@/api"
import _ from "lodash";
import { Dialog } from "@blueprintjs/core";

export function AddExternalServiceDialog({ isOpen, onClose, onSuccess }) {

    return (
        <Dialog isOpen={isOpen} title="Add External Service" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(90vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium height--nearly-full">
                <div className="height--full-width--most">
                    <InsertEditExternalService onClose={onClose} onSuccess={onSuccess} />
                </div>
            </div>
        </Dialog>
    );
}

export function EditExternalServiceDialog({ isOpen, onClose, tag }) {

    const {data: externalservice, isSuccess : isExternalServiceSuccess} = api.maintenance.externalservice.queryExternalService.useGetExternalServiceByTag({tag : tag}, { enabled : _.isString(tag) && isOpen})    
    return (
        <Dialog  isOpen={isOpen} title="Edit External Service" onClose={onClose} style={{ width: "min(600px,85vw)", height: "min(90vh, 900px)" }} canOutsideClickClose={false}>
            <div className="padding--medium height--nearly-full">
                <div className="height--full-width--most">
                    {isExternalServiceSuccess ? (
                        <InsertEditExternalService
                            isEditing={true}
                            tag={tag}
                            preDescription={externalservice.description}
                            preName={externalservice.name}
                            preCompany={externalservice.company}
                            preEmail={externalservice.email}
                            preCosts={externalservice.costs} 
                            preBilling_number={externalservice.billing_number}
                            preInternal_id={externalservice.internal_id}
                            onClose={onClose}
                        />
                    ) : null}
                </div>
            </div>
        </Dialog>
    );
}

