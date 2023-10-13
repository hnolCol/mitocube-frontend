import PropTypes from "prop-types"
import _ from "lodash"
import { Link } from "react-router-dom"

function NewSubmission({
    authStatus,
}
) {
    return (
        <div>

            <Link to="/submission/new">start from scratch</Link>
            <Link to="/submission/existing">Project Finished</Link>
        </div>
    )
    }

NewSubmission.propTypes  = {
    authStatus: PropTypes.object.isRequired,
    
}


export default NewSubmission