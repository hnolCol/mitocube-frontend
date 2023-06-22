
import PropTypes from "prop-types"
import { Header } from "../../base/Header"
import { Link, useLocation } from "react-router-dom"
import "../navigation.css"

Tabs.propTypes = {
    tabs : PropTypes.arrayOf(PropTypes.object).isRequired
}

TabItem.propTypes = {
    text: PropTypes.string.isRequired,
    to : PropTypes.string.isRequired
}

function TabItem({text,to, active}) {
    
    return (
       
        <div className={"bg--lightgrey tabs__item" + `${active ? "" : " tabs__item-inactive"}`}>
             <Link className="router-link" {...{to}}>
            <Header {...{ text }} hexColor={active ? "#466688" : "#696969"} />
            </Link>
        </div>
        
    )
}

function Tabs({tabs, selectFirstTabIfPathNameDoesNotMatch = true}) {
    const location = useLocation()
    const locationMatches = tabs.filter(tab => tab.to === location.pathname).length > 0 
    return (
        <div className="flex tabs__container">
        {tabs.map((tab,tabIdx) => {
            return (
                <TabItem key={`${tabIdx}-${tab.text}`}
                    active={locationMatches?location.pathname === tab.to:selectFirstTabIfPathNameDoesNotMatch?tabIdx===0:false}
                    {...{ to: tab.to, text: tab.text }} />
        )})}
        </div>
    )
}

export default Tabs 



