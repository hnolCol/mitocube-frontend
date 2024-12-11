import { useEffect } from "react";
import PropType from 'prop-types'
import { useGetUnitsByUnitType } from "../../../../hooks/queries/unittypes.hooks";
import { FeatureInput } from "../../input/api/FeatureInput";
import _ from "lodash"
import { Combobox } from "../../input/Combobox";
import { addItemToArrayOrRemoveIfPresentByTag } from "../../../../services/arrays/transforms";
import { Loading } from "../states/Loading";


export function FeatureUnitType({ attribute_tag, trait_tag, unittype_tag, onChange, value, unit_name, unit_tag, units }) {

    const hasValue = _.isArray(value) && value.length > 0

    const unit = units.filter(u => u.tag === unit_tag)[0]
    
    /**
     * @description Saves the feature to value which is handled outside this component to store the data
     * compared to other UnitTypes the feature type returns a list of features instead a single value. 
     * This is crucial since you can have multiple affected featureus such as in a knockdown experiment
     * @param {import("../../../../types/feature").Feature} item 
     */
    const handleFeatureSelection = (item) => {
        const updatedValue = addItemToArrayOrRemoveIfPresentByTag({ array: value, item })
        onChange(attribute_tag, trait_tag, unittype_tag, unit_tag, unit.text, updatedValue)
    }

    return (
        <div className="flex" style={{ width: "24rem" }}> 
            <div className="flex flex-column div--expand" style={{ color: hasValue ? "#466688" : "#000000" }}>

                <div className="font-size--small" style={{overflow:"hidden"}}>{`${unit_name}`}</div>
            <FeatureInput
                proteome_ids={[unit_tag]}
                selectedItems={value}
                fill
                onItemSelect={(attribute, item) => handleFeatureSelection(item)}
                rightElement={
                    <div style={{ maxHeight: "1rem" }}>
                        <Combobox
                            small
                            onChange={(item) => onChange(attribute_tag,
                                                        trait_tag,
                                                        unittype_tag,
                                                        item.tag,
                                                        item.value,
                                                        value)}
                            value={unit.text}
                            items={units}
                            textKey="text"
                            labelKey="description"
                            buttonProps={{
                                text: `${unit.text}\u25BC`, //special here to show the more common name.
                                minimal: true,
                                small: true,
                                intent: hasValue ? "primary" : "warning",
                                style: {
                                    marginLeft: "0px",
                                    marginRight: "3px",
                                    paddingLeft: "0px",
                                    paddingRight: "0.0px"
                                }
                        }} /></div>}
            
                />
                </div>
        </div>
    )
}

FeatureUnitType.defaultProps = {
    value : []
}

FeatureUnitType.propType = {
    attribute_tag: PropType.string.isRequired,
    trait_tag: PropType.string.isRequired,
    unittype_tag: PropType.string.isRequired,
    onChange: PropType.func.isRequired,
    value: PropType.arrayOf(PropType.object),
    unit: PropType.object,
    units: PropType.arrayOf(PropType.object).isRequired,
    unit_name: PropType.string
}