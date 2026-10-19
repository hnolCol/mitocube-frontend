import _ from "lodash"
import { TooltipButton } from "@/comps/core/base/buttons/TooltipButton"
import { StateSelection } from "../filter/StateSelection"
import { UserDatasetFilter } from "../filter/UserFilter"
import { ConditionApplicationFilter } from "../filter/ConditionApplicationFilter"

export function StatisticsFilterSelection({ submissionFilter, setSubmissionFilter, children }) {

    const hasStateFilter = _.has(submissionFilter, "states") && submissionFilter.states.size > 0
    const hasUserFilter = _.isArray(submissionFilter.user) && submissionFilter.user.length > 0
    const hasCAFilter = _.isArray(submissionFilter.ca_tags) && submissionFilter.ca_tags.length > 0
    const hasActiveFilter = hasStateFilter || hasUserFilter || hasCAFilter

    return (
        <div className="submission__wrapper">
            <div className="flex flex-column submission__side__filter__container" style={{ gridRow: 1, gridColumn: 1 }}>
                <div className="flex center-items" style={{ justifyContent: "space-between" }}>
                    <h3>Statistics Filter</h3>
                    <TooltipButton
                        content="Clear the statistics filter selection."
                        icon="cross"
                        small={true}
                        onClick={() => setSubmissionFilter({})}
                        intent={hasActiveFilter ? "danger" : "none"}
                    />
                </div>
                <span className="font-size--smallest" style={{ marginTop: "0.25rem" }}>
                    The statistics below are calculated only on the submissions that match the selected filters.
                </span>
                <div style={{ marginTop: "0.5rem" }}>
                    <StateSelection {...{ submissionFilter, setSubmissionFilter }} />
                </div>
                <div style={{ marginTop: "0.5rem" }}>
                    <UserDatasetFilter {...{ setSubmissionFilter, submissionFilter }} />
                </div>
                <div style={{ marginTop: "1rem" }}>
                    <ConditionApplicationFilter
                        {...{ setSubmissionFilter, submissionFilter }}
                        infoText="Only submissions containing the selected condition applications are included in the statistics."
                    />
                </div>
            </div>
            <div className="submission__items__container" style={{ gridRow: 1, gridColumn: 2 }}>
                {children}
            </div>
        </div>
    )
}
