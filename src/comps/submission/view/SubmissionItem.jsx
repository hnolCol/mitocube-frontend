import { ContextMenu, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { TraitWithValueInput, SampleAttributeTagWithTooltip } from "../../core/base/tags/TagWithTooltip";
import { UserIconWithTooltip } from "../../core/base/user";
import { isHexColorLight } from "../../../services/colors";
import { titleFormat } from "../../../services/format/string";
import { copyTextToClipboard } from "../../../services/clipboard";
import { useNavigate } from "react-router";
import { AttributeFeatureTag } from "../new/sample_attributes/view/DatasetAttributesHierarchy";
import { TitleText } from "../../core/metrics/ItemBasics";
import { CreatedAt } from "../../core/metrics/CreatedAt";
import { SampleAttributesView } from "../../core/base/attributes/SampleAttributesView";
import { motion } from "framer-motion";
import PropTypes from "prop-types"
import _ from "lodash"


import hooks from "@mitocube/api-hooks"
import { SubmissionTitle } from "./SubmissionTitle";


MinimalSubmissionItem.propTypes = {
    tag: PropTypes.string.isRequired
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
export function MinimalSubmissionItem({ tag, onClick, redirectOnClick = true, showCreatedAt = true }) {
    const redirect = useNavigate()
    const { data: created_at } = hooks.submissions.useGetSubmissionCreatedAt({ tag }, { enabled: _.isString(tag) && tag.length > 0 })
    return (
        <motion.button style={{ backgroundColor: "#efefef", border: "none" }} whileHover={{ backgroundColor: "#e0e0e0" }}
            onClick={(e) => {
                onClick ? onClick(e) : null
                // Redirect to the submission view
                redirectOnClick ? redirect(`/submissions/${tag}`) : null
                e.stopPropagation()
            }} className="submission__item__container bg--white">
            <div className="flex"> 
                {_.isNumber(created_at) && showCreatedAt?<span><CreatedAt createdat={created_at} addFromNow={false} /> |</span> : null}
                <span className="padding-left--little"> <SubmissionTitle tag={tag} showEdit={false} showCopyToClipboard={false} /> </span>
            </div>
        </motion.button>
    )
}


