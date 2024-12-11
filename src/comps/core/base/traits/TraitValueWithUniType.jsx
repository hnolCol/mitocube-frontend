import PropType from 'prop-types'
import _ from "lodash"
import {  useGetAttributeUnitType, useGetTrait } from "../../../../hooks/queries/attribute.hooks"
import { useEffect, useState } from 'react'
import { Button } from '@blueprintjs/core'
import { UnitTypeLoader } from '../units/UnitTypeLoader'



TraitValueWithUnitType.defaultProps = {
    attribute_tag: "att_compound",
    trait_tag: "dmso"
}


TraitValueWithUnitType.propType = {
    attribute_tag: PropType.string.isRequired,
    trait_tag: PropType.string.isRequired,
    onSelect: PropType.func.isRequired
}
/**
 * @description Visualizes a trait value for which the user is able to define certain TraitValues. 
 * The values describe the trait itself. Which value might be inserted, depend on the DB which returns 
 * so called UnitTypes. For example, a compound that is added to the cell culture should be defined 
 * with a corresponding concentration and time (duration) of treatment. 
 * This component should be used if the user is allowed to enter units, if the component
 * should just display the units/user input if available and the trait. 
 * @param {Object} props 
 * @param {String} props.attribute_tag The attribute_tag associated with the trait_tag 
 * @param {String} props.trait_tag The trait_tag. Must be matching to the attribute_tag since the 
 * @param {Function} props.onSelect
 * @param {Object} props.prevValues - The values that were defined for this trait. 
 * UnitType is depending on the attribute, not on the trait. 
 * @returns 
 */
export function TraitValueWithUnitType({attribute_tag, trait_tag, onSelect, prevValues}) {

    const [userUnitInputs, setUserUnitInputs] = useState({})
    const { data, isSuccess, isError, error } = useGetAttributeUnitType({ tag: attribute_tag })// concentration/mass/duration 
    const { data: trait } = useGetTrait({ tag: trait_tag, include_input: false })
    
    if (isError && error.status_code === 404) return //404 error indicates that there is no unit for this attribute.
    if (isError) {
        console.log("Error in API call TraitValueWithUnitTypes. Using function useGetAttributeUnitType:", error)
    }

    /**
     * @description Check if the user entered sufficient information  for the trait_tag 
     * @returns {Boolean} If all required information are provided. 
     */
    const checkIfInputIsComplete = (unitInput) => {
        if (!isSuccess || !_.has(data, attribute_tag)) return false
        if (_.isEmpty(unitInput)) return false 

        return _.every(data[attribute_tag]
            .map(unittype_tag =>
                _.has(unitInput, [attribute_tag,trait_tag,unittype_tag,"value"]) && //check if value in the object exists 
                _.has(unitInput, [attribute_tag,trait_tag,unittype_tag,"unit_tag"]) && // check if unit exists 
                _.isString(unitInput[attribute_tag][trait_tag][unittype_tag]["unit_tag"]) && // check if unit is defined 
                unitInput[attribute_tag][trait_tag][unittype_tag]["value"] !== undefined && //check that value is not undefined (can only be string or array)
                unitInput[attribute_tag][trait_tag][unittype_tag]["value"].length > 0 //check for length
        ))
    }

    const onChange = (attribute_tag, trait_tag, unittype_tag, unit_tag, unit_text, value) => {
        const userInputProps = { ...userUnitInputs }
        //add the objects if they are null... 
        userInputProps[attribute_tag] ??= {}
        userInputProps[attribute_tag][trait_tag] ??= {}
        userInputProps[attribute_tag][trait_tag][unittype_tag] ??= {}
        userInputProps[attribute_tag][trait_tag][unittype_tag]["unit_tag"] = unit_tag
        userInputProps[attribute_tag][trait_tag][unittype_tag]["value"] = value
        userInputProps[attribute_tag][trait_tag][unittype_tag]["unit_text"] = unit_text
        setUserUnitInputs(prevValues => { return {...prevValues, ...userInputProps } })
    }


    useEffect(() => {
        if (!_.isObject(prevValues)) return 
        if (!checkIfInputIsComplete(prevValues)) return 
        setUserUnitInputs(prevValues)
    },[prevValues])

    return (
        <div className='div--expand flex flex-column '>
            <div>{_.isObject(trait) && _.has(trait,"text")?<h4>{trait.text}</h4>:null}</div>
            <div className='flex' style={{flexWrap : "wrap", columnGap : "0.2rem", rowGap : "0.2rem"}}>
                
                {isSuccess && _.isObject(data) && _.has(data, attribute_tag) ?
                    
                    data[attribute_tag]
                        .map(unittype_tag => 
                            <UnitTypeLoader
                                key  = {`${attribute_tag}-${trait_tag}-${unittype_tag}-feature-seletion`}
                                attribute_tag={attribute_tag}
                                unittype_tag={unittype_tag}
                                trait_tag={trait_tag}
                                onChange={onChange}
                                unit_tag={_.has(userUnitInputs, [attribute_tag, trait_tag, unittype_tag, "unit_tag"]) ?
                                    userUnitInputs[attribute_tag][trait_tag][unittype_tag]["unit_tag"]
                                    : undefined}
                                value={_.has(userUnitInputs, [attribute_tag, trait_tag, unittype_tag, "value"]) ?
                                        userUnitInputs[attribute_tag][trait_tag][unittype_tag]["value"]
                                        : unittype_tag === "feature" ? [] : undefined}
                            />) : null}
            </div>
            <div>
                <Button icon="tick" text="" minimal intent="primary" disabled={!checkIfInputIsComplete(userUnitInputs)}
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelect(userUnitInputs)
                    }} />
                {/* <Button icon="cross" minimal intent='warning'/> */}
            </div>
        </div>
    )
}

