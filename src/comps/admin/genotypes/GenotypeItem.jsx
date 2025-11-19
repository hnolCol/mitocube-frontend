import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { GenotypeText } from "./GentotypeText"
import { GenotypeDescription } from "./GentotypeDescription"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"
import { EditGenotypeDialog } from "./AddGentoypeDialog"
import { useState } from "react"
import { set } from "lodash"


/**
 * React component to display genotype Item
 * @param {Object} props  
 * @param {String} props.tag The tag of the genotype to display the Item
 */


export function GenotypeItem({ tag, showDetails = false }) {
  console.log(tag)
  const [isOpen, setIsOpen] = useState(false)
  const [update, setUpdate] = useState(undefined)
  const { data: permissions, isSuccess } =
    hooks.genotypes.useGetGenotypePermissions();

  const handleRemove = (e) => {
    e.stopPropagation();
  };
  const canShowRemoveButton = isSuccess && !_.isEmpty(permissions) && permissions?.role === 2;
   
  const handleEditClose = () => {
      setUpdate(Date.now())
      setIsOpen(false)
    }
   

  return (
    <div className="flex flex-column margin--medium padding--little div--expand">
      <EditGenotypeDialog isOpen={isOpen} onClose={() => handleEditClose()} tag = {tag}/>
      <div
        className="flex justify-space-between align-center"
        style={{ width: "100%" }}
      >
        <GenotypeText tag={tag} update={update} />
        <button onClick={() => setIsOpen(true)} className="button--link font-size--smallest">
          Edit
        </button>

        {canShowRemoveButton && (
          <RemoveButton onRemove={handleRemove} fontColor={"#e63946"} />
        )}
      </div>


      {showDetails ? (
        <div
          className="flex font-size--smallest margin-left--little"
          style={{ color: "#555" }}
        >
          <GenotypeDescription tag={tag} update={update} />
        </div>
      ) : null}
    </div>
  );
}






