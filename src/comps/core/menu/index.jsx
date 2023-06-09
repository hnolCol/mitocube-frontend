import { Menu, } from "@blueprintjs/core";
import { Popover2, MenuItem2 } from "@blueprintjs/popover2";
import PropTypes from "prop-types"

import { BaseDashboardIcon } from "../svg/icons/dashboard/IconBase"
import MenuDashboardIcon from "../svg/icons/dashboard/Menu"


function BasicMenu({ items = [], width = 30, height=30 }) {
    
    return (
        
        <Popover2 content={<Menu>
            {items.map((itemProps,itemIdx) => <MenuItem2 key={`dash-menu-${itemIdx}`} {...itemProps} />)}
        </Menu>}>
            <BaseDashboardIcon width={width} height={height}>
                <MenuDashboardIcon/>
            </BaseDashboardIcon>
        </Popover2>

    )
}


BasicMenu.propTypes = {
    items: PropTypes.array.isRequired,
    width: PropTypes.number,
    height: PropTypes.number
    
}

export default BasicMenu