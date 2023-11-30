import PropTypes from "prop-types"
import _ from "lodash"
import { Link } from "react-router-dom"
import DescriptionButton from "../../core/base/buttons/DescriptionButton"

function NewSubmission({}
) {
    return (
        <div className="flex center-items justify-center div--expand" >
            <div className="flex flex-column center-items">
                <div className="flex flex--wrap justify-space-between">
                    <Link to="/submission/new" className="router-link">
                        <DescriptionButton
                            headerText="New sample submission."
                            descriptionItems={["My samples are still in a tube.", "I don't have a result file yet."]} />
                    </Link>
                    <Link to="/submission/existing" className="router-link">
                        <DescriptionButton
                            headerText="Submit analysed data."
                            descriptionItems={["I have a result file and all samples are measured.","I have checked the data using some quality control."]} /></Link>
                    </div>
                </div>
            </div>
    )
    }

NewSubmission.propTypes  = {
    authStatus: PropTypes.object.isRequired,
    
}


export default NewSubmission