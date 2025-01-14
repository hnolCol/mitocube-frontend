import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms"
import { UserInput } from "../../../core/input/api/UserInput"

export function CollaboratorsTab(submission, setSubmission){

    const handleCollaboratorSelection = (callbackKey, selectedUser) => {
        //save collaborations that are seleted
        setSubmission(prevValues => {
            return {
                ...prevValues,
                collaborators: addItemToArrayOrRemoveItIfPresent({
                    array: prevValues.collaborators,
                    item: selectedUser
                })
            }
        })
    }

    return (<div>
        <h3>Contact and Collaborators</h3>
        {/* <span>Project owner: </span><span className="h0-span">{authenticationStatus.firstname} {authenticationStatus.lastname}</span> */}
            {/* <div><span>Unique identifier: </span> <span className="h0-span">{tag}</span></div> */}
        
        <UserInput
            selectedUsers={submission.collaborators}
            onUserSelect={handleCollaboratorSelection}
            isRequired={false}
            showLabel={true}
            helperText="Collaborators will also be informed about the state of your project." />
            
    </div>
    )
}