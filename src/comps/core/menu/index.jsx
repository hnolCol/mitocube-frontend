import { Menu, Popover, MenuItem } from "@blueprintjs/core";
import PropTypes from "prop-types"

import { BaseDashboardIcon } from "../svg/icons/dashboard/IconBase"
import MenuDashboardIcon from "../svg/icons/dashboard/Menu"


function BasicMenu({ items = [], width = 30, height=30, disabled = false }) {
    
    return (
        
        <Popover  {...{disabled}} content={<Menu>
            {items.map((itemProps,itemIdx) => <MenuItem key={`dash-menu-${itemIdx}`} {...itemProps} />)}
        </Menu>}>
            <BaseDashboardIcon width={width} height={height}>
                <MenuDashboardIcon/>
            </BaseDashboardIcon>
        </Popover>
    )
}


BasicMenu.propTypes = {
    items: PropTypes.array.isRequired,
    width: PropTypes.number,
    height: PropTypes.number
    
}

export default BasicMenu