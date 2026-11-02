import { useState } from "react";
import _ from "lodash"; 
import { api } from "@/api"
import { EditExternalServiceDialog } from "./AddExternalServiceDialog";
import { DeleteExternalServiceDialog } from "./DeleteExternalServiceDialog";
import { ExternalServiceDescription } from "./ExternalServiceComponents";
import { ExternalServiceName } from "./ExternalServiceComponents";
import { ExternalServiceCompany } from "./ExternalServiceComponents";
import { ExternalServiceCosts } from "./ExternalServiceComponents";
import { ExternalServiceEmail } from "./ExternalServiceComponents";
import { ExternalServiceBillingNumber } from "./ExternalServiceComponents";
import { ExternalServiceInternalID } from "./ExternalServiceComponents";

export function ExternalServiceItem({ tag, showDetails = false, updateExternalServiceList }) {

    const [ isOpen, setIsOpen ] = useState(false);  
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [update, setUpdate] = useState(undefined);
    
    const { data: permissions, isSuccess } = api.maintenance.externalservice.queryExternalService.useGetExternalServicePermissions();
    // console.log(permissions)

    const { mutate: deleteExternalService } = api.maintenance.externalservice.modifyExternalService.useDeleteExternalService({
        onSuccess: () => {
            setIsDeleteOpen(true); 
        },
    });
  
    const canShowRemoveButton = isSuccess && permissions.delete

      const handleRemove = (e) => {
        e.stopPropagation();
        deleteExternalService({ tag });
      };
      
    

    const handleEditClose = () => {
        setUpdate(Date.now())
        setIsOpen()
      }

    const handleDeleteDialogClose = () => {
        setIsDeleteOpen(false);
        updateExternalServiceList();
        
      }

    return (
        <div className="flex flex-column padding--medium width--full">


            <EditExternalServiceDialog isOpen={isOpen} onClose={() => handleEditClose()} tag = {tag}/>
            <DeleteExternalServiceDialog isOpen={isDeleteOpen} onClose={handleDeleteDialogClose}/>

            <div className="flex justify-space-between align-center width--full">
            
            
            <ExternalServiceDescription tag={tag} update={update} />
            <div className="flex gap--small align-center gap--medium-small">
            {permissions?.edit && (
                <button onClick={() => setIsOpen(true)} className="basic-button ">
                    Edit
                </button>)}


                {canShowRemoveButton && (
                    <button onClick={handleRemove} className="basic-button">
                        Delete
                    </button>
                )}
            </div>

            </div>
           

            {showDetails ? (
            <table
                style={{
                width: "fit-content",
                fontSize: "0.75rem",
                textAlign: "left",
                marginTop: "0.25rem",
                }}
            >
            <tbody>
            <tr>
                <th className="table-head-cell">Name</th>
                <td><ExternalServiceName tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th className="table-head-cell">Email</th>
                <td><ExternalServiceEmail tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th className="table-head-cell">Company</th>
                <td><ExternalServiceCompany tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th className="table-head-cell">Cost</th>
                <td><ExternalServiceCosts tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th className="table-head-cell">Billing Nummber</th>
                <td><ExternalServiceBillingNumber tag={tag} update={update} /></td>
            </tr>

            <tr>
                <th className="table-head-cell">Internal ID</th>
                <td><ExternalServiceInternalID tag={tag} update={update} /></td>
            </tr>
            </tbody>
        </table>

            ) : null}
        </div>
    );
}

