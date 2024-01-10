import PropTypes, { object } from 'prop-types';
import { DashboardItem } from './DashboardItem';
import "../navigation.css"




function Leftbar ({
    isAuthenticated,
    basePathName,
    navigationItems = [
        { name: "Explore Datasets", linkTo: "/datasets", iconName: "Dataset"},
        { name: "Explore protein-centric data", linkTo: "/protein", iconName: "Protein" },
        { name: "Explore post-translational modifications", linkTo: "/ptm", iconName: "Ptm"},
        { name: "Performance Monitoring", linkTo: "/performance", iconName: "PerformanceMonitor" },
        { name: "Sample Submission", linkTo: "/submission", iconName: "SampleSubmission" },
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


// export function MCLeftbar({ firstLevelItems = [], secondLevelItems = {} }) {
//     const [isOpened, toggleContainer] = useCycle(false,true)
//     const containerControls = useAnimation()
    
//     // const containerVariants = {
//     //   hidden: {
//     //     height : "2rem",
//     //     width: "3rem",
//     //     backgroundColor : "#efefef"
//     //   },
//     //   visible: {
//     //     height : "12rem",
//     //     width: "12rem",
//     //     backgroundColor : "#efefef"
//     //   }
//     // }
  
//     useEffect(() => {
//       if (!isOpened) {
//         containerControls.start("hidden")
//       }
//       else {
//         containerControls.start("visible")
//       }
//     }, [isOpened, containerControls])
    
//     return (
//       <div>
      
//       <motion.div
//         className="left-container"
//         // initial="iconview"
//         // style={{height:"2rem",width:"3rem"}}
//         // animate={containerControls}
//         // variants={containerVariants}
//         transition={{duration: 1, type:"tween", staggerChildren : 1, delayChildren: 0.6, staggerDirection : isOpened?1:-1}}
//       >
//         {/* <Chevron callbackFn={toggleContainer}/> */}
//         {firstLevelItems.map((firstLevelItem, fItemIdx) => {
  
//           return (
           
//               <MenuItem
//                 key={`${fItemIdx}${firstLevelItem.text}`}
//                 isOpened={isOpened}
//                 i={fItemIdx}
//                 item={{ text: firstLevelItem.text, iconName : firstLevelItem.iconName}} />
           
            
//           )
//         })}
//         </motion.div>
//         </div>
//     )
//   }
  
//   MCLeftbar.defaultProps = {
//     firstLevelItems : [{name : "Dataset View", to : "/dataset", iconName : "Dataset"}, {name : "Protein View", to : "/protein", iconName : "Protein"},{name : "Performance Monitoring", to : "/performance", iconName : "Performance"},{name : "Sample Submission", to : "/submission", iconName : "Sample"}, {name : "Performance", to : "/performance", iconName : "Electrospray"}]
//   }