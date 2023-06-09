import { useGetSubmissionsID } from "../../../hooks/queries/submission.hooks"
import PropTypes from "prop-types"
import { Header } from "../../core/base/Header"


function NewSubmission({
        authStatus,
        }
        ) {

    const { data : submissionID, isLoading : submissionIDLoading, error} = useGetSubmissionsID()
    console.log(submissionID)
    console.log(error)

    if (submissionID === undefined) return <div>Loading...</div>

    return (
            
        <div>
            <p>
                In this section, you can enter details about your new project. If you are looking for advise for your experimental design visit the <a href="/submission/help"><span className="a-span">help section</span></a>.</p>
            
            <p>The unique identifier <span className="h1-span">{submissionID.dataID}</span> has been assigned to your new project. Please include this identifier (id) in any request about this project.
                All files (such as raw file) will include the identifier. Please note that you will be notified via email when the state of your project changes. 
            </p>
            <p>Please fill all fields below regarding your new project.</p>
                
            </div>

        )
    }

NewSubmission.propTypes  = {
    authStatus: PropTypes.object.isRequired,
    
}


export default NewSubmission