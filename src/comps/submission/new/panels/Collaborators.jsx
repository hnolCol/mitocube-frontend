import { addStringToArrayOrRemove } from "../../../../services/arrays/transforms"
import { UserInput } from "../../../core/input/api/UserInput"

export function CollaboratorsTab({submission, setSubmission}){

    const handleCollaboratorSelection = (callbackKey, user) => {
        //save collaborations that are seleted
        setSubmission(prevValues => {
            return {
                ...prevValues,
                collaborators:  addStringToArrayOrRemove({array : prevValues.collaborators, string : user})   
            }
        })
    }

    return (<div>
        <h3>Contact and Collaborators</h3>
        {/* <span>Project owner: </span><span className="h0-span">{authenticationStatus.firstname} {authenticationStatus.lastname}</span> */}
            {/* <div><span>Unique identifier: </span> <span className="h0-span">{tag}</span></div> */}
        
        <UserInput
            selected_users={submission.collaborators}
            onUserSelect={handleCollaboratorSelection}
            isRequired={false}
            showLabel={true}
            helperText="Collaborators will also be informed about the state of your project. By default, collaborators cannot edit your submission." />
    
        




    </div>
    )
}