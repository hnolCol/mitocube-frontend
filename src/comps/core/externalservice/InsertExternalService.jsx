import hooks from "@mitocube/api-hooks";
import { useEffect, useState } from "react";
import _ from "lodash";
import APIError from "../error/APIerror";

const INITIAL_EXTERNAL_SERVICE = { tag: "", description: "", name: "", company: "", email: "", costs: "", billing_number: "", internal_id: "" };

/**
 * Insert / Edit External Service Component
 */
export function InsertEditExternalService({ 
    onClose,
    onSuccess,
    isEditing = false,
    tag,
    preDescription = "",
    preName = "",
    preCompany = "",
    preEmail = "",
    preCosts = "",
    preBilling_number = "",
    preInternal_id = "",
}) {

    console.log(onSuccess, _.isFunction(onSuccess));
    
    const [externalservice, setExternalService] = useState(INITIAL_EXTERNAL_SERVICE);
    const {mutate : postExternalService, isLoading, isError, error, isSuccess } = hooks.maintenance.externalservice.usePostExternalService({
        onSuccess: () => {
            setExternalService(INITIAL_EXTERNAL_SERVICE);
            onClose(true);   
        }
    });
    const { mutate : updateExternalService, isLoading : isUpdateLoading } = hooks.maintenance.externalservice.useUpdateExternalService()


    useEffect(() => {
        if (isEditing) {
            setExternalService({
                description: preDescription,
                name: preName,
                company: preCompany,
                email: preEmail,
                costs: preCosts,
                billing_number: preBilling_number,
                internal_id: preInternal_id
            });
        }
    }, [isEditing, preDescription, preName, preCompany, preEmail, preCosts, preBilling_number, preInternal_id]);
    

 
    const insertExternalService = () => {

        const data = {
            description: externalservice.description,
            name: externalservice.name,
            company: externalservice.company,
            email: externalservice.email,
            costs: Number(externalservice.costs) || 0,
            billing_number: externalservice.billing_number,
            internal_id: externalservice.internal_id
        };

        console.log("externalservice:", externalservice)

        postExternalService(data, {
            onSuccess: (external_service_tag) => {
                setExternalService(INITIAL_EXTERNAL_SERVICE);
        
                if (_.isFunction(onSuccess)) {
                    console.log(external_service_tag)
                    onSuccess(external_service_tag);
                }
        
                onClose();
            },
            onError: (err) => {
                console.error("Failed to insert external service", err);
            },
        });
        
    };


    const editExternalService = () => {
        const data = {
            tag,
            description: externalservice.description,
            name: externalservice.name,
            company: externalservice.company,
            email: externalservice.email,
            costs: Number(externalservice.costs) || 0,
            billing_number: externalservice.billing_number,
            internal_id: externalservice.internal_id
        };

        updateExternalService(data, {
            onSuccess: () => onClose(),
            onError: (err) => {
                console.error("Failed to edit External Service", err)
            }
        });
    };



    return (
        <div className="flex flex-column div--expand margin--medium padding--medium" style={{ gap: "0.4rem" }}>
            <h3>{isEditing ? "External Service Editing" : "External Service Insertion"}</h3>
            <span>External Service represents an third-party company or person that performs maintenance on an instrument.  </span>

            <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                <input className="text-input" type="text" value={externalservice.description} placeholder="Enter external service description" onChange={(e) => setExternalService((prev) => ({ ...prev, description: e.target.value }))} />
                <input className="text-input" type="text" value={externalservice.name} placeholder="Enter name of person performing the external service" onChange={(e) => setExternalService((prev) => ({ ...prev, name: e.target.value }))} />
                <input className="text-input" type="text" value={externalservice.company} placeholder="Enter company name" onChange={(e) => setExternalService((prev) => ({ ...prev, company: e.target.value }))} />
                <input className="text-input" type="text" value={externalservice.email} placeholder="Enter contact email" onChange={(e) => setExternalService((prev) => ({ ...prev, email: e.target.value }))} />
                <input className="number-input" type="number" value={externalservice.costs ?? "" } placeholder="Enter costs" onChange={(e) => setExternalService((prev) => ({ ...prev, costs: e.target.value }))} />
                <input className="text-input" type="text" value={externalservice.billing_number} placeholder="Enter billing number" onChange={(e) => setExternalService((prev) => ({ ...prev, billing_number: e.target.value }))} />
                <input className="text-input" type="text" value={externalservice.internal_id} placeholder="Enter internal ID" onChange={(e) => setExternalService((prev) => ({ ...prev, internal_id: e.target.value }))} />
            </div>

  
            <div className="margin--medium"> {isSuccess && !isEditing ? (<h3 style={{ color: "#68a063" }}>External Service inserted successfully!</h3>) : null}
            </div>{isError ? <APIError error={error} /> : null}


            <div className="div--expand flex flex-column" style={{ justifyContent: "space-between" }}>
            <div className="flex justify-end" style={{ gap: "1rem" }}>
                <button className="dialog-button" style={{ backgroundColor: "#ec7160ff" }} onClick={onClose}>Close</button>
                {isEditing ? 
                    <button className="dialog-button" disabled={isUpdateLoading} onClick={editExternalService }>{isUpdateLoading ? "Editing..." : "Edit"}</button> : 
                    <button className="dialog-button" disabled={isLoading} onClick={insertExternalService }>{isLoading ? "Inserting..." : "Insert"}</button> }
                </div>
            </div>
        </div>
    );
}
