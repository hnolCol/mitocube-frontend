
import PropTypes from "prop-types"
import { Header } from "../../base/Header"
import { Link, useLocation } from "react-router-dom"
import _ from "lodash"
import "../navigation.css"

Tabs.propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.object).isRequired,
    rightHeader : PropTypes.string,
    selectFirstTabIfPathNameDoesNotMatch : PropTypes.bool
}

TabItem.propTypes = {
    text: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    active : PropTypes.bool
}

function TabItem({text,to, active = false}) {
    // React Tab Item Component to visualize a Tab in the Topbar
    return (
        <div className={"bg--lightgrey tabs__item" + `${active ? "" : " tabs__item-inactive"}`}>
            <Link className="router-link" {...{ to }}>
                <div className="div--expand tabs__item__inner" >
                    <Header {...{ text }} hexColor={active ? "#466688" : "#696969"} />
                </div>
            </Link>
        </div>
        
    )
}

function Tabs({ tabs, rightHeader, selectFirstTabIfPathNameDoesNotMatch = true }) {
    // Container for Tabs in the Topbar.
    const location = useLocation()
    const locationMatches = tabs.filter(tab => tab.to === location.pathname).length > 0 
    return (
        <div className="flex tabs__container">
        {tabs.map((tab,tabIdx) => {
            return (
                <TabItem key={`${tabIdx}-${tab.text}`}
                    active={locationMatches?location.pathname === tab.to:selectFirstTabIfPathNameDoesNotMatch?tabIdx===0:false}
                    {...{ to: tab.to, text: tab.text }} />
            )
        })}
            {_.isString(rightHeader) && rightHeader.length > 0 ?
                <div className="div--expand tabs__item intent-margin-left">
                    <Header {...{ text : rightHeader }} hexColor={"#466688"} /></div> : null}
        </div>
    )
}

export default Tabs 



