import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { GenotypeText } from "./GentotypeText"
import { GenotypeDescription } from "./GentotypeDescription"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"


// /**
//  * React component to display genotype Item
//  * @param {Object} props  
//  * @param {String} props.tag The tag of the genotype to display the Item
//  */
// export function GenotypeItem({tag, showDetails = false}) {

//     const handleRemove = (e) => {

//     }

//     return <div className="flex flex-column margin--medium padding--little div--expand">
//         <div className="flex justify-space-between" style={{width : "100%"}}>
//             <GenotypeText  tag={tag}/>
//             <RemoveButton onRemove={handleRemove} fontColor={"#00ffff"}/>
//         </div>

//         { showDetails ? 
//             <div className="flex font-size--smallest margin-left--little">
//                 <GenotypeDescription  tag={tag}/>
//             </div> 
//             : 
//             null }
        
//     </div>
// } 


export function GenotypeItem({ tag, showDetails = false }) {
  const { data: permissions, isSuccess } =
    hooks.genotypes.useGetGenotypePermissions();

    const handleRemove = (e) => {
    e.stopPropagation();
  };
  const canShowRemoveButton = isSuccess && !_.isEmpty(permissions) && permissions?.role === 2;
   

  return (
    <div className="flex flex-column margin--medium padding--little div--expand">
      <div
        className="flex justify-space-between align-center"
        style={{ width: "100%" }}
      >
        <GenotypeText tag={tag} />

        {canShowRemoveButton && (
          <RemoveButton onRemove={handleRemove} fontColor={"#e63946"} />
        )}
      </div>


      {showDetails ? (
        <div
          className="flex font-size--smallest margin-left--little"
          style={{ color: "#555" }}
        >
          <GenotypeDescription tag={tag} />
        </div>
      ) : null}
    </div>
  );
}






