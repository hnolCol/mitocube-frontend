
import _ from "lodash"
import { useOutletContext } from "react-router"
import { StaticStateIndicator } from "../../core/base/states/SubmssionState"

import { CreatedAt } from "../../core/metrics/CreatedAt"

import { api } from "@/api"

function Timeline() {
    const { submission_tag } = useOutletContext()   
    
    const { data: created_at, isSuccess: isCreatedAtSuccess } = api.submissions.core.useGetSubmissionCreatedAt(
        { tag: submission_tag }, 
        { enabled: _.isString(submission_tag) && submission_tag.length > 0 }
    )
    
    const { data: state, isSuccess } = api.submissions.states.useGetSubmissionState({ tag: submission_tag })
    
    const { data: stateHistory, isLoading: historyIsLoading, isSuccess: historyIsSuccess } = api.submissions.states.useGetStateHistory(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) && submission_tag.length > 0 }
    )

    const formatUserName = (entry) => {
        if (entry.user_firstname || entry.user_lastname) {
            return `${entry.user_firstname || ''} ${entry.user_lastname || ''}`.trim()
        }
        return null
    }

    return (
        <div>
            {isSuccess ? (
                <div>
                    <h2>Project Timeline</h2>
                    {isCreatedAtSuccess ? (
                        <p style={{ marginBottom: "1.5rem" }}>
                            Project started: <CreatedAt createdat={created_at} />
                        </p>
                    ) : null}
                    
                    <div className="flex center-items" style={{ marginBottom: "2rem" }}>
                        The current state of the project is: <StaticStateIndicator state_tag={state} padding="tiny" />
                    </div>

                    <h3 style={{ marginBottom: "1rem" }}>State History</h3>
                    {historyIsLoading ? (
                        <div>Loading timeline...</div>
                    ) : historyIsSuccess && _.isArray(stateHistory) && stateHistory.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {stateHistory.map((entry, idx) => {
                                const userName = formatUserName(entry)
                                return (
                                    <div 
                                        key={idx} 
                                        className="flex" 
                                        style={{ 
                                            alignItems: "center"
                                        }}
                                    >
                                        <span style={{ minWidth: "200px" }}>
                                            <CreatedAt createdat={entry.created_at} />
                                        </span>
                                        <span style={{ margin: "0 1rem", color: "#999" }}>→</span>
                                        <StaticStateIndicator state_tag={entry.state_tag} padding="tiny" />
                                        {userName && (
                                            <span style={{ marginLeft: "1rem", color: "#666", fontSize: "0.9rem" }}>
                                                by {userName}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div>No state history available yet.</div>
                    )}
                </div>
            ) : null}
        </div>
    )
}


export default Timeline