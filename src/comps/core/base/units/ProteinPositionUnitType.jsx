import PropType from "prop-types"
import { useGetUnitsByUnitType } from "../../../../hooks/queries/unittypes.hooks"
import NumericValueInput from "../../input/Numeric"
import { Combobox } from "../../input/Combobox"
import { Loading } from "../../base/states/Loading"
import { useEffect, useState } from "react"
import _ from "lodash"
import { Button, Dialog } from "@blueprintjs/core"
import { PositionSelection } from "../protein/PositionSelection"
import PropTypes from "prop-types"


const IS_SELECTION_RANGE = {
    "position:aa" : false,
    "position:aa_range" : true 
}

const IS_SUBSTITUTION = {
    "att_protein_mutation:substitution": true,
    "att_protein_mutation:insertion" : true
}


ProteinPositionUnitType.propTypes = {
    attribute_tag: PropTypes.string.isRequired,
    trait_tag: PropTypes.string.isRequired,
    feature_tag: PropTypes.string.isRequired,
    value: PropTypes.string,
    unit_name: PropTypes.string,
    unit_tag: PropTypes.string,
    unittype_tag: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    units: PropTypes.arrayOf(PropTypes.object)
}

export function ProteinPositionUnitType({ attribute_tag, trait_tag, feature_tag, unittype_tag, onChange, value, unit_tag, unit_name, units }) {
    const [isOpen, setIsOpen] = useState(false)
    const hasValue = _.isString(value) && value.length > 0 && _.isNumber(_.toNumber(value))   
    const unit = units.filter(u => u.tag === unit_tag)[0]

    return (
        <div className="flex" style={{ width: "16rem" }}>
            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}><PositionSelection
                singlePosition={!IS_SELECTION_RANGE[unit_tag]}
                aaSubstitution={_.has(IS_SUBSTITUTION,trait_tag) && IS_SUBSTITUTION[trait_tag]}
                feature_tag={feature_tag} /></Dialog>
                <div className="flex flex-column div--expand" style={{color:hasValue?"#466688" : "#000000"}}>
                    <div className="font-size--small" style={{overflow:"hidden"}}>{`${unit_name}`}</div>
                <div className="flex">
                <NumericValueInput
                        callbackKey={`${unittype_tag}`}
                        placeholder={"..."}
                        value={value}
                        onChange={(cb,value) => onChange(attribute_tag,trait_tag,unittype_tag,unit_tag,unit.text,value)}
                        rightElement={
                            <div className="flex">     
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
                                    }} />
                                <Button text="P" minimal small onClick={() => setIsOpen(true)} />
                            </div>} />
                        <div>
                            
                        </div>
                        </div>
                </div>
            
        </div>
    )
}


ProteinPositionUnitType.propTypes = {
    attribute_tag: PropType.string.isRequired,
    trait_tag: PropType.string.isRequired,
    feature_tag: PropType.string.isRequired,
    unittype_tag: PropType.string.isRequired,
    onChange: PropType.func.isRequired,
    value: PropType.string,
    unit: PropType.object
}