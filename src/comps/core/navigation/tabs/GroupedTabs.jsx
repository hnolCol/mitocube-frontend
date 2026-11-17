import PropTypes from "prop-types"
import _ from "lodash"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Popover, Tooltip } from "@blueprintjs/core"

GroupedTabs.propTypes = {
    groups: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        tabs: PropTypes.arrayOf(PropTypes.shape({
            text: PropTypes.string.isRequired,
            to: PropTypes.string.isRequired,
            disabled: PropTypes.bool,
            note: PropTypes.string,
            disabledHint: PropTypes.string,
            exact: PropTypes.bool
        })).isRequired
    })).isRequired
}

TabItem.propTypes = {
    text: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    active: PropTypes.bool,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,
    note: PropTypes.string,
    disabledHint: PropTypes.string
}

function TabItem({ text, to, active = false, onSelect, disabled = false, note, disabledHint }) {
    const redirect = useNavigate()
    const button = <button
        className={"basic-button--small " + `${active ? "basic-button--highlighted" : ""}`}
        style={{
            cursor: disabled ? "not-allowed" : "pointer",
            display: "flex",
            width: "100%",
            margin: "0.15rem 0",
            fontWeight: active ? 600 : 400,
            opacity: disabled ? 0.5 : 1
        }}
        onClick={() => {
            if (disabled) return
            redirect(to)
            if (_.isFunction(onSelect)) onSelect()
        }}
    >
        {text}
        {disabled && _.isString(note) ? <span className="font-size--smallest" style={{ marginLeft: "0.3rem", color: "#8a8a8a" }}>{note}</span> : null}
    </button>
    if (disabled && _.isString(disabledHint)) {
        return <Tooltip compact={true} content={disabledHint}>
            <div style={{ width: "100%" }}>{button}</div>
        </Tooltip>
    }
    return button
}

/**
 * Admin navigation: groups of tabs rendered as a horizontal strip of group
 * buttons. Each group button opens a dropdown listing its tabs; the group
 * button is highlighted while the current route belongs to the group.
 */
function GroupedTabs({ groups }) {

    const location = useLocation()
    const [openGroup, setOpenGroup] = useState(null)

    const isActive = tab => tab.exact
        ? location.pathname === tab.to
        : location.pathname === tab.to || _.startsWith(location.pathname, tab.to + "/")

    const activeGroup = groups.find(group => group.tabs.some(isActive))
    const activeTab = activeGroup ? activeGroup.tabs.find(isActive) : null

    return <div className="flex tabs__container" style={{ flexWrap: "wrap", gap: "0.2rem" }}>
        {groups.map(group => {
            const isGroupActive = activeGroup?.text === group.text
            return <Popover
                key={group.text}
                placement="bottom-start"
                isOpen={openGroup === group.text}
                onClose={() => setOpenGroup(null)}
                minimal
                enforceFocus={false}
                content={<div className="flex flex-column" style={{ padding: "0.25rem", minWidth: "11rem" }}>
                    {group.tabs.map(tab => <TabItem
                        key={tab.to}
                        text={tab.text}
                        to={tab.to}
                        active={activeTab?.to === tab.to}
                        onSelect={() => setOpenGroup(null)}
                        disabled={tab.disabled}
                        note={tab.note}
                        disabledHint={tab.disabledHint}
                    />)}
                </div>}
            >
                <button
                    className={"padding--little tabs__item " + `${isGroupActive ? "tabs__item-active" : "tabs__item-inactive"}`}
                    style={{
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontWeight: isGroupActive ? 600 : 400
                    }}
                    onClick={() => setOpenGroup(openGroup === group.text ? null : group.text)}
                >
                    {group.text}
                    {isGroupActive && activeTab ? <span style={{ fontSize: "0.75rem", color: "#888" }}>/ {activeTab.text}</span> : null}
                    <span className="basic-button--small">▾</span>
                </button>
            </Popover>
        })}
    </div>
}

export default GroupedTabs
