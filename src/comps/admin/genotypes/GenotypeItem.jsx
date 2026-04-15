import { api } from "@/api"
import _ from "lodash"
import { GenotypeText } from "./GentotypeText"
import { GenotypeDescription } from "./GentotypeDescription"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"
import { EditGenotypeDialog } from "./AddGentoypeDialog"
import { useState } from "react"
import { set } from "lodash"
import { DeleteGenotypeDialog } from "./DeleteGenotypeDialog"

/**
 * React component to display genotype Item
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the Item
 */


export function GenotypeItem({ tag, showDetails = false, updateGenotypeList }) {
 
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [update, setUpdate] = useState(undefined)
  const [currentTag, setCurrentTag] = useState(tag)

  const { data: permissions, isSuccess } = api.genotypes.queryGenotypes.useGetGenotypePermissions();

  const { mutate: deleteGenotype } = api.genotypes.modifyGenotypes.useDeleteGenotype({
    onSuccess: () => {
        setIsDeleteOpen(true); 
      },
  }); 

  const canShowRemoveButton = isSuccess && permissions.delete
  console.log(canShowRemoveButton)

  const handleRemove = (e) => {
    e.stopPropagation();
    deleteGenotype({ currentTag });
  };


  const handleEditClose = (success, newTag) => {
    if (success && newTag) {
      setCurrentTag(newTag)  // update tag when edit succeeds
  }
      setUpdate(Date.now())
      setIsOpen()
    }
   
  const handleDeleteDialogClose = () => {
      setIsDeleteOpen(false);
      console.log("handleDeleteDialogClose called", typeof updateGenotypeList)
      updateGenotypeList();
      
    }

  return (
    <div className="flex flex-column padding--medium" style={{ width: "100%" }}>
      
      <EditGenotypeDialog isOpen={isOpen} onClose={handleEditClose} tag={currentTag} />
      <DeleteGenotypeDialog isOpen={isDeleteOpen} onClose={handleDeleteDialogClose}  />

      <div
        className="flex justify-space-between align-center"
        style={{ width: "100%" }}
      >
       
        <GenotypeText tag={currentTag} update={update} />
        <div className="flex gap--small align-center" style={{ gap: "0.4rem" }}>
                <button onClick={() => setIsOpen(true)} className="basic-button ">
                    Edit
                </button>

                {canShowRemoveButton && (
                    <button onClick={handleRemove} className="basic-button ">
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
          <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>Description</th>
            <td><GenotypeDescription tag={currentTag} update={update}/></td>
          </tr>
        </tbody>
        </table>
      ) : null}
    </div>
  );
}






