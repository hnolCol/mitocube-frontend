import { SampleSubmissionDashboardIcon } from "../../svg/icons/dashboard/SampleSubmission";
import PropTypes from "prop-types"
import _ from "lodash";
import PerformanceMonitorDashboardIcon from "../../svg/icons/dashboard/PerformanceMonitor";
import DatasetDashboardIcon from "../../svg/icons/dashboard/Dataset";
import SettingDashboardIcon from "../../svg/icons/dashboard/Settings";
import PTMDashboardIcon from "../../svg/icons/dashboard/Ptm";
import ProteinDashboardIcon from "../../svg/icons/dashboard/Protein";
import AIChatIcon from "../../svg/icons/dashboard/AIChat";

const icons = {
    Protein : ProteinDashboardIcon,
    SampleSubmission: SampleSubmissionDashboardIcon,
    PerformanceMonitor: PerformanceMonitorDashboardIcon,
    Dataset: DatasetDashboardIcon,
    Settings:  SettingDashboardIcon,
    Ptm: PTMDashboardIcon,
    AIChat: AIChatIcon
  }
  
getDashBoardIcon.propTypes = {
    iconName: PropTypes.string,
    iconProps : PropTypes.object
}

export function getDashBoardIcon(iconName, iconProps) {
    if (_.has(icons, iconName)) {
        const MenuIcon = icons[iconName]
        return <MenuIcon {...iconProps}/>
    }
    

}