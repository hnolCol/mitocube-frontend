import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import _ from "lodash"

function AttributeValueSelectionMenu({activeItem, attributes, attributeValuesByID, handleItemSelect, maxItems = 10}) {
    const nothingToShow = _.isEmpty(attributeValuesByID)
    return (
        <Menu>
            {nothingToShow ? <MenuItem text="No attributes found ..." disabled={true} />: attributes.map(attribute =>
                _.has(attributeValuesByID,attribute.id) ? 
                    <div key={`${attribute.tag}`}>
                        <MenuItem text={attribute.name} disabled={true} />
                        <MenuDivider />
                        <div style={{overflowY : "visible"}}>
                            {attributeValuesByID[attribute.id].map((attributeValue, index) =>
                                index === maxItems + 1 ? <MenuItem
                                    key={`${attributeValue.name}-${attributeValue.tag}`}
                                    text=" . . . not all items shown, please use the search function.."
                                    disabled={true} /> : index > maxItems + 1 ? null :
                                <MenuItem
                                    active = {activeItem.id === attributeValue.id}
                                    key={`${attributeValue.name}-${attributeValue.tag}`}
                                            text={attributeValue.name}
                                            labelElement={<div style={{ width: "18rem" }}>{attributeValue.details}</div>}
                                    onClick={ () => handleItemSelect(attribute,attributeValue)}/>)}
                        </div>
                    </div> : null)}
            
            </Menu>
    )
}

export default AttributeValueSelectionMenu