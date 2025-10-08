
import { MenuItem, Button } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import hooks from "@mitocube/api-hooks";
import _ from "lodash"; 
import PropTypes from "prop-types"


/**
 * StateMenuItem component for rendering a single state item in the selection menu.
 * @param {Object} props - Component props.
 * @param {String} props.state_tag - The tag of the state.
 * @returns {JSX.Element} The rendered state menu item.
 */
export function StateMenuItem({state_tag, handleClick, modifiers, query, current_state_tag}) {
    const { data: stateName } = hooks.states.useGetStateName({ tag: state_tag })
    const { data: stateColor } = hooks.states.useGetStateColor({ tag: state_tag })

    return (
        <MenuItem
            active={modifiers.active}
            disabled={modifiers.disabled || state_tag === current_state_tag}
            key={state_tag}
            onClick={handleClick}
            text={stateName}
            style={{ color: stateColor }}
        />
    );
}

StateMenuItem.propTypes = {
    state_tag: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired,
    modifiers: PropTypes.object.isRequired,
    query: PropTypes.string
}

/**
 * StateSelectionMenu component for selecting submission states.
 * @param {Object} props - Component props.
 * @param {Function} props.onSelection - Callback function to handle state selection.
 * @returns {JSX.Element} The state selection menu component.
 */
export function StateSelectionMenu({ onSelection, current_state_tag }) {

    const { data: submissionStates } = hooks.submissions.states.useGetStates()

    return (


        <Select
            items={_.isArray(submissionStates) ? submissionStates : []}
            onItemSelect={(item) => {
                if (_.isFunction(onSelection)) {
                    onSelection(item)
                }
            }}
            filterable={false}
            itemRenderer={(item, { handleClick, modifiers }) => (
                <StateMenuItem key={item} state_tag={item} handleClick={handleClick} modifiers={modifiers} current_state_tag={current_state_tag} />
            )}
        >
            <Button icon="chevron-down" minimal small/>

        </Select>
    )
}

StateSelectionMenu.propTypes = {
    onSelection: PropTypes.func.isRequired
}
