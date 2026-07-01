
import PropTypes from "prop-types"
import { useLocation, useNavigate } from "react-router-dom"
import _ from "lodash"
import "../navigation.css"
import { motion } from "framer-motion"

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

function TabItem({text,to, active = false, can_close = false, handleClose = undefined}) {
    // React Tab Item Component to visualize a Tab in the Topbar
    const redirect = useNavigate()
    return (
        <motion.div className={"padding--little tabs__item " + `${active? "tabs__item-active" : "tabs__item-inactive"}`}> 
           
                <div style={{display : "grid", gridTemplateColumns : can_close ? "1fr 1rem" : "1fr", height:"1.5rem", gridTemplateRows : "1fr"}}>
                    <div style={{gridColumn : 1, gridRow : 1, display:"flex"}}>
                    <motion.button style={{ outline: "none", border: "none", backgroundColor: "transparent" }} onClick={() => redirect(to)}>{text}</motion.button>
                    </div>
                       
                    {can_close && _.isFunction(handleClose) ? <div style={{ gridColumn: 2, gridRow: 1, display: "flex" }}>
                    <motion.button whileHover={{ color: "#466688" }}
                        onClick={() => handleClose(to)}
                        style={{ border: "none", backgroundColor: "transparent", outline: "none", fontWeight: 700, color: "#000" }}>
                        x
                    </motion.button>
                    </div> : null}
                </div>
        
        </motion.div>
        
    )
}

function Tabs({ tabs, rightHeader, selectFirstTabIfPathNameDoesNotMatch = true, canClose = undefined, handleClose = undefined, textMap = undefined }) {
  
    const location = useLocation()
    let locationMatches = tabs.filter(tab => tab.to === location.pathname)
    if (locationMatches.length === 0){
        locationMatches = tabs.filter(tab => _.startsWith(location.pathname, tab.to))    
    }

    return (
        <div className="flex tabs__container">

        {tabs.map((tab,tabIdx) => {
            return (
                <TabItem key={`${tabIdx}-${tab.text}`}
                    active={locationMatches.length > 0? _.includes(locationMatches, tab) :selectFirstTabIfPathNameDoesNotMatch?tabIdx===0:false}
                    {...{ to: tab.to, text: textMap?.get(tab.text) ?? tab.text, can_close : !_.isArray(canClose)?false:canClose[tabIdx], handleClose}} />
            )
        })}
            {_.isString(rightHeader) && rightHeader.length > 0 ?
                <div className="div--expand tabs__item intent-margin-left" style={{textAlign:"right"}}>
                    <h3>{rightHeader}</h3> </div>: null}
        </div>
    )
}

export default Tabs 



