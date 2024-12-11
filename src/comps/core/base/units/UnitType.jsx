import PropType from "prop-types"
import { useGetUnitsByUnitType } from "../../../../hooks/queries/unittypes.hooks"
import NumericValueInput from "../../input/Numeric"
import { Combobox } from "../../input/Combobox"
import { Loading } from "../../base/states/Loading"
import { useEffect, useState } from "react"
import _ from "lodash"

export function UnitTpye({ attribute_tag, trait_tag, unittype_tag, onChange, value, unit_tag, unit_name, units}) {
    const hasValue = _.isString(value) && value.length > 0 && _.isNumber(_.toNumber(value))   
    const unit = units.filter(u => u.tag === unit_tag)[0]
    return (
        <div className="flex" style={{ width: "8rem" }}>
                <div className="flex flex-column div--expand" style={{color:hasValue?"#466688" : "#000000"}}>
                    <div className="font-size--small" style={{overflow:"hidden"}}>{`${unit_name}`}</div>
                    <NumericValueInput
                        callbackKey={`${unittype_tag}`}
                        placeholder={"..."}
                        value={value}
                        onChange={(cb,value) => onChange(attribute_tag,trait_tag,unittype_tag,unit_tag,unit.text,value)}
                        rightElement={
                            <div>
                            <Combobox
                                small
                                    onChange={(item) => onChange(attribute_tag,
                                        trait_tag,
                                        unittype_tag,
                                        item.tag,
                                        item.text,
                                        value)}
                                value={unit.text}
                                items={units}
                                textKey="text"
                                labelKey="description"
                                buttonProps={{
                                    text : `${unit.text}\u25BC`,
                                    minimal: true,
                                    small: true,
                                    intent: hasValue? "primary" : "warning",
                                    style: {
                                        marginLeft: "0px",
                                        marginRight: "3px",
                                        paddingLeft: "0px",
                                        paddingRight: "0.0px"
                                    }
                                }} /></div>} />
                
                </div>
            
        </div>
    )
}


UnitTpye.propTypes = {
    attribute_tag: PropType.string.isRequired,
    trait_tag: PropType.string.isRequired,
    unittype_tag: PropType.string.isRequired,
    onChange: PropType.func.isRequired,
    value: PropType.string,
    unit: PropType.object
}