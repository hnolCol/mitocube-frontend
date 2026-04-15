

import { Tooltip } from "@blueprintjs/core"
import { api } from "@/api";
import _ from "lodash"
import { RemoveButton } from "../../core/base/buttons/RemoveButton"
import PropTypes from "prop-types"

/**
 * @description
 * Displays a symptom fetched by its tag. Shows the symptom text and a Tooltip containing the symptom description.
 * Optionally renders a remove button which, when clicked, calls the provided onRemove callback with the tag.
 *
 * @param {string} tag - Identifier used to fetch the symptom (required).
 * @param {function} [onRemove] - Optional callback invoked as onRemove(tag) when the remove button is pressed.
 */

export function Symptom({ tag, onRemove }) {
    
    const { data: symptom, isSuccess } = api.maintenance.symptoms.querySymptoms.useGetSymptomByTag({ tag })
    return  <div>{isSuccess ?
        <Tooltip content={<div style={{maxWidth : "30rem"}}>{symptom.description}</div>}>
            <div className="flex margin--little padding--little bg--grey">
            <div className="">{symptom.text}</div>
            {_.isFunction(onRemove) ? <RemoveButton onRemove={() => onRemove(tag)} /> : null}
            </div>
        </Tooltip>: null }
    </div > 
}

Symptom.propTypes = {
  tag: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
}

Symptom.defaultProps = {
  onRemove: undefined,
}
