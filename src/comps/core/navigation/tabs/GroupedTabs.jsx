import PropTypes from "prop-types"
import _ from "lodash"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Popover, Tooltip } from "@blueprintjs/core"
import { getItemFromLocalStorage, saveInLocalStorage } from "../../../services/localstorage"

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
    })).isRequired,
    storageScope: PropTypes.string
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
function GroupedTabs({ groups, storageScope = "global" }) {

    const location = useLocation()
    const redirect = useNavigate()
    const [openGroup, setOpenGroup] = useState(null)
    const [lastTabByGroup, setLastTabByGroup] = useState({})

    const lastTabStorageName = (groupText) => `groupedTabsLastTab_${storageScope}_${groupText}`

    const lastTabOfGroup = (group) => {
        const known = lastTabByGroup[group.text]
        if (known) return known
        const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: lastTabStorageName(group.text) })
        const stored = itemFound && _.isString(itemValue) && group.tabs.find(tab => tab.to === itemValue) !== undefined
            ? group.tabs.find(tab => tab.to === itemValue)
            : undefined
        return stored ?? group.tabs[0]
    }

    const setLastTab = (group, tab) => {
        saveInLocalStorage({ itemName: lastTabStorageName(group.text), itemValue: tab.to })
        setLastTabByGroup(prev => ({ ...prev, [group.text]: tab }))
    }

    const isActive = tab => tab.exact
        ? location.pathname === tab.to
        : location.pathname === tab.to || _.startsWith(location.pathname, tab.to + "/")

    const activeGroup = groups.find(group => group.tabs.some(isActive))
    const activeTab = activeGroup ? activeGroup.tabs.find(isActive) : null

    // visiting a tab (also via URL) makes it the group's "last used" tab
    useEffect(() => {
        if (activeGroup && activeTab) setLastTab(activeGroup, activeTab)
    }, [activeGroup?.text, activeTab?.to])

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
                        onSelect={() => { setLastTab(group, tab); setOpenGroup(null) }}
                        disabled={tab.disabled}
                        note={tab.note}
                        disabledHint={tab.disabledHint}
                    />)}
                </div>}
            >
                <div
                    className={"padding--little tabs__item " + `${isGroupActive ? "tabs__item-active" : "tabs__item-inactive"}`}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.1rem",
                        fontWeight: isGroupActive ? 600 : 400
                    }}
                >
                    <button
                        style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", fontWeight: "inherit" }}
                        title={`Go to ${lastTabOfGroup(group).text}`}
                        onClick={() => redirect(lastTabOfGroup(group).to)}
                    >
                        {group.text}
                        {isGroupActive && activeTab ? <span style={{ fontSize: "0.75rem", color: "#888" }}>/ {activeTab.text}</span> : null}
                    </button>
                    <button
                        className="basic-button--small"
                        style={{ border: "none", backgroundColor: "transparent", cursor: "pointer" }}
                        onClick={() => setOpenGroup(openGroup === group.text ? null : group.text)}
                    >
                        ▾
                    </button>
                </div>
            </Popover>
        })}
    </div>
}

export default GroupedTabs
