import PropTypes from 'prop-types';

import "../navigation.css"
import { Link } from 'react-router';
import { BaseDashboardIcon } from '../../svg/icons/dashboard/IconBase';
import { getDashBoardIcon } from './Icons';


export const DashboardItem = ({
    name = "Sample Submission",
    iconName = "SampleSubmission",
    linkTo = "/submission",
    iconProps = {},
    isSelected = false }) => {
    //wrapper for dashboard items on the leftbar. 
    
    return (

        <div className='flex bg--grey center-items dashboard__item'>
            <Link to={linkTo}>
                <div>
                
                    <BaseDashboardIcon>
                        {getDashBoardIcon(iconName,{...iconProps, fillColor : !isSelected?"#929293":"#466688", isSelected})}
                    </BaseDashboardIcon>
                
                </div>
            </Link>
            </div>
        
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

  
