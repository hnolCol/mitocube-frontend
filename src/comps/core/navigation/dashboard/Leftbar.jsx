import PropTypes, { object } from 'prop-types';
import { DashboardItem } from './DashboardItem';
import "../navigation.css"




function Leftbar ({
    isAuthenticated,
    basePathName,
    navigationItems = [
        { name: "Explore Datasets", linkTo: "/datasets", iconName: "Dataset"},
        { name: "Explore protein-centric data", linkTo: "/protein", iconName: "Protein" },
        { name: "Compare", linkTo: "/compare", iconName: "Compare" },
        // { name: "Cross-Submission", linkTo: "/analysis", iconName: "Dataset" },
        // { name: "Explore post-translational modifications", linkTo: "/ptm", iconName: "Ptm"},
        { name: "Performance Monitoring", linkTo: "/performance", iconName: "PerformanceMonitor" },
        { name: "Sample Submission", linkTo: "/submissions", iconName: "SampleSubmission" },
        { name: "Modular Procedures", linkTo: "/modular-procedures", iconName: "ModularProcedures" },
        // { name : "Chat with AI", linkTo: "/ai/chat", iconName: "AIChat" },
        { name: "Settings", linkTo: "/admin", iconName: "Settings" }]
            }) {
   
    return (
        <div
        className="dashboard__leftcontainer bg--lightgrey">
        {navigationItems.map((firstLevelItem, fItemIdx) => {
  
          return (
            
              <DashboardItem
                  key={fItemIdx}
                  {...firstLevelItem}
                  isAuthenticated={isAuthenticated}
                  isSelected={basePathName === firstLevelItem.linkTo.replace("/","")}
                  />
            
          )
        })}
        </div>
    )
}
  
Leftbar.propTypes = {
    isAuthenticated: PropTypes.bool,
    basePathName : PropTypes.string,
    navigationItems : PropTypes.arrayOf(object)
}

export default Leftbar

