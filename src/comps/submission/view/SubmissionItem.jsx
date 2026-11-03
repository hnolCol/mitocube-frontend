
import { useNavigate } from "react-router";
import { CreatedAt } from "../../core/metrics/CreatedAt";
import { motion } from "framer-motion";
import PropTypes from "prop-types"
import _ from "lodash"


import { SubmissionTitle } from "./SubmissionTitle";



import { api } from "@/api";
import "../../welcome/welcome.css";

MinimalSubmissionItem.propTypes = {
    tag: PropTypes.string.isRequired,
    state_tag: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

SubmissionStateColorLine.propTypes = {
    state_tag: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

/**
 * Renders a vertical line in the color of the given state, placed to the left of a submission item
 * as an extension of the state indicator.
 * @param {Object} props
 * @param {string|number} props.state_tag - The tag of the state whose color should be displayed.
 * @returns {JSX.Element|null} The colored line or null if the state color is not available.
 */
export function SubmissionStateColorLine({ state_tag }) {
    const { data: stateColor } = api.states.useGetStateColor({ tag: state_tag })
    if (!_.isString(stateColor)) return null
    return <div className="submission-item-state-line" style={{ backgroundColor: stateColor }} />
}


/**
 * Minimal Submission Item
 * @param {Object} props
 * @param {string} props.tag - The tag of the submission to be displayed in a minimal view.
 * @param {Function} props.onClick - The function to be called when the submission item is clicked. If redirectOnClick is true, this function is called before the redirection.
 * @param {boolean} props.redirectOnClick - Whether to redirect to the submission view on click. Default is true.
 * @param {boolean} props.showCreatedAt - Whether to show the created at date. Default is true.
 * @description A minimal submission item that displays the created at date and the title of the submission.
 * @returns {JSX.Element} A minimal submission item that displays the created at date and the title of the submission.
 */
export function MinimalSubmissionItem({ tag, state_tag, onClick, redirectOnClick = true, showCreatedAt = true }) {
    const redirect = useNavigate()
    const { data: created_at } = api.submissions.core.useGetSubmissionCreatedAt({ tag }, { enabled: _.isString(tag) && tag.length > 0 })
    return (
        <div className="flex width--full">
            {state_tag != null ? <SubmissionStateColorLine state_tag={state_tag} /> : null}
            <motion.button
                onClick={(e) => {
                    onClick ? onClick(e) : null
                    // Redirect to the submission view
                    redirectOnClick ? redirect(`/submissions/${tag}`) : null
                    e.stopPropagation()
                }} whileHover={{ scale: 1.01 }} className="submission-item-btn width--expand">
                <div className="flex">
                    <div>{_.isNumber(created_at) && showCreatedAt ? <div className="flex justify-space-between" style={{ width: "6rem" }}><CreatedAt createdat={created_at} addFromNow={false} /> <span>|</span></div> : null}</div>
                    <span className="padding-left--little"> <SubmissionTitle tag={tag} showEdit={false} showCopyToClipboard={false} /> </span>
                </div>
            </motion.button>
        </div>
    )
}


