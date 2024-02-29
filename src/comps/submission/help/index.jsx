import { useGetSubmissionHelp } from "../../../hooks/queries/submission.hooks"
import PropTypes from "prop-types"
import { Header } from "../../core/base/Header"


function SubmissionHelp({
    authStatus,

}) {

    return (
        
        <div>
            <p>This section provides information and guidelines about starting a new project/submission, including a list of frequently asked questions. </p>

            <Header text="Quick Start" />


            {[
                { metric: "Number of independent replicates", value: 4 },
                { metric: "Minimum required amount", value: "25 µg" }
            ].map((metricInfo, metricIdx) => <div key={`${metricIdx}-quick-start-help`}>{metricInfo.metric} : <span className="h1-span">{metricInfo.value}</span></div>)}

            <Header text="Frequently asked questions"/>

        </div>
    )
}

SubmissionHelp.propTypes = {
    authStatus : PropTypes.object
}

export default SubmissionHelp