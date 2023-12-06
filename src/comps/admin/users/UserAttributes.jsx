import { useMemo, useState } from "react";
import { Header } from "../../core/base/Header";
import Loading from "../../core/base/loading";
import TextInput from "../../core/input/Text";
import _ from "lodash"
import { groupListByProperty } from "../../../services/arrays/groupby";
import { Combobox } from "../../core/input/Combobox";


function UserAttributes({ attributes, attributeValues, userProps, updateUserProps}) {

    const attributeValuesByID = useMemo(() => {
        if (!_.isArray(attributeValues)) return []
        return groupListByProperty(attributeValues,"attribute_id")
        
    }, [attributeValues])

    return (

        <div className="flex flex-column bg--lightgrey padding--medium margin--little" style={{maxWidth : "500px", maxHeight : "400px"}}>
            {
                attributes.map(attr => {
                    const hasValues = _.has(attributeValuesByID, attr.id)
                    const valueSaved = _.has(userProps, attr.tag)
                    // this happens when the user is beeing editen and userProps is not an attributeValue but a string.
                    // this should not be done, and we have to think about how to store the user. 
                    const selectedItem = valueSaved && hasValues && !_.isObject(userProps[attr.tag]) ? attributeValuesByID[attr.id].filter(attrValue => attrValue.name === _.toString(userProps[attr.tag]))[0] : userProps[attr.tag]
                    if (hasValues) return <Combobox
                        key={attr.tag}
                        hint={attr.name}
                        items={attributeValuesByID[attr.id]}
                        callbackKey={attr.tag}
                        placeholder={valueSaved && _.isObject(selectedItem) ? selectedItem.name : "Select value.."}
                        textKey="name"
                        labelKey={"details"}
                        onChange={(attributeTag, attributeValue) => updateUserProps(attributeTag, attributeValue)} />
                
                    return <TextInput
                        key={attr.tag}
                        callbackKey={attr.tag}
                        hint={attr.name}
                        placeholder=""
                        value={valueSaved ? userProps[attr.tag] : ""}
                        onChange={(attributeTag, valueString) => updateUserProps(attributeTag, valueString)} />
                })}

        </div>
    )
}

export default UserAttributes