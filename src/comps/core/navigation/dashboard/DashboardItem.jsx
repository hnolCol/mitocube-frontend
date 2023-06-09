import PropTypes from 'prop-types';
import { motion, useAnimation } from "framer-motion";
import { useState } from 'react';

import "../navigation.css"
import { Link } from 'react-router-dom';
import { BaseDashboardIcon } from '../../svg/icons/dashboard/IconBase';
import { getDashBoardIcon } from './Icons';


export const DashboardItem = ({
    name = "Sample Submission",
    iconName = "SampleSubmission",
    linkTo = "/submission",
    iconProps = {},
    isAuthenticated = false,
    isSelected = false}) => {
    //wrapper for dashboard items on the leftbar. 
    const controls = useAnimation()
    const [mouseOver, setMouseOver] = useState(false)
    

    
    const handleMouseEnter = () => {
      //when mouse enters - a popup will showup giving more information to the user.
      if (!isAuthenticated) return //dont show any tooltip when not logged in. To indicate that action is required.
      controls.start({ left: "4rem", opacity: 1, transition: { duration: 0.7, delay: 0.5, type: "spring" } })
      setMouseOver(true)
    }
    const handleMouseLeave = () => {
      // make the popover dissapear.
      controls.start({ left: "-5rem", opacity: 1, transition: { duration: 0.3 } })
      setMouseOver(false)
    }
    
    
    return (

        <motion.div 
            className='flex bg--grey center-items dashboard__item'
            // onMouseEnter={handleMouseEnter}
            // onMouseLeave={handleMouseLeave}
            >
         
            <motion.div
                animate={undefined}
                className="dashboard__item__tooltip bg--grey flex center-items">
                    <div>{name}</div> 
            </motion.div >  
            <div>
                <Link to={linkTo}>
                    <BaseDashboardIcon>
                        {getDashBoardIcon(iconName,{...iconProps, fillColor : !isSelected?"#929293":"#466688", isSelected})}
                    </BaseDashboardIcon>
                </Link>
                {/* mouseOver?"#047433" : isSelected? "#b93418":"#466688" */}
            </div>
            </motion.div>
        
      );
}


DashboardItem.propTypes = {
    name: PropTypes.string,
    iconName: PropTypes.string,
    linkTo: PropTypes.string,
    iconProps: PropTypes.object,
    isAuthenticated : PropTypes.bool,
    isSelected : PropTypes.bool
}

  
