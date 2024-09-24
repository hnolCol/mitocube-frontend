import { NumericInput } from "@blueprintjs/core"
import { Combobox } from "../../input/Combobox"
import _ from "lodash"
import { useEffect } from "react"
import { useGetAttributeUnit } from "../../../../hooks/queries/attribute.hooks"


export function UnitSelectionTag({ attribute, attributeValue, onSave, initValues, selectedRows}) {
    const [userInput, setUserInput] = useState({})
    const { data : attribute_units, isLoading, isFetching, isSuccess } = useGetAttributeUnit({tag : attribute.tag}, {enabled : _.isBoolean(attribute.has_unit) && attribute.has_unit})
    useEffect(() => {
        if (initValues !== undefined) setUserInput(initValues)
    }, [])
    
    const handleSave = () => {
        onSave(attribute,attributeValue,userInput)
    }
    
    
    return (
        <div className="padding--medium">
            <h4>{attributeValue.text}</h4>
            <p> ell</p>
            <div className="padding--little">
                {isLoading || isFetching ? <Loading /> : isSuccess ? <div>
                    {attribute_units.units.map((unit,idx) => {
                        return (
                            <UnitInput {...{
                                unit,
                                focusInput : idx===0,
                                prefixes: attribute_units.prefixes,
                                onValueChange: handleInput,
                                selection: _.has(userInput, unit.tag) ? userInput[unit.tag] : undefined,
                                isTime : unit.tag == "time"
                            }} />
                        )
                    })}
                    </div> : null}

            </div>
            </div>
    )

}

export function AttributeValueInput({ attribute, attributeValues, onSave }) {
    
    const [userInput, setUserInput] = useState({})
    
    const { data: attribute_units, isLoading, isFetching, isSuccess } = useGetAttributeUnit({ tag: attribute.tag }, { enabled: _.isBoolean(attribute.has_unit) && attribute.has_unit })
    
    const handleInput = (value, attributeValue, unit, isPrefix = false, time_unit = false) => {
        
        if (isPrefix)
            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        time_unit : "s",
                        ...prevValues[unit.tag],
                        prefix: value,
                        unit
                    }
                }
            })
        else if (time_unit) {

            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        prefix : "NA",
                        ...prevValues[unit.tag],
                        unit,
                        time_unit : value
                    }
                }
            })

        }
        else {
            setUserInput(prevValues => {
                return {
                    ...prevValues,
                    [unit.tag]: {
                        prefix : "NA",
                        time_unit : "s",
                        ...prevValues[unit.tag],
                        value,
                        unit
                    }
                }
            })
        }
    }


    return (
        <div>
            <div>
                {/* {attributeValues.map(attributeValue => )} */}
                </div>
                    
                    <ButtonGroup alignText="right">
                    <Button text="Save" minimal intent="primary" onClick={handleSave}/>
                    <Button text="Close" minimal intent="none" onClick={() => setIsOpen(false)}/>
                </ButtonGroup>
        </div>)

}


const TIME_UNITS = [
    { text: "s", description: "Seconds"},
    { text : "min", description : "Minutes"},
    { text : "h", description : "Hours"},
    { text: "d", description: "Days"},
    { text: "w", description: "Weeks"},
    { text : "a", description : "Year"}
]

/**
 * 
 * @param {Object} props 
 * @param {Object} props.unit - Describe this!! TODO
 * @param {Object[]} props.prefixes 
 * @param {Function} props.onValueChange - Function that is called on value change. Must except the arguments (value : string, unit : Object and prefix : bool)
 * and hence is being used for text/numeric input and prefix selection. 
 * @param {Object} props.selection - The current selection of 'value' and 'prefix'  
 * @returns 
 */
export function UnitInput({ unit, prefixes, onValueChange, selection = { value: "", prefix: "NA", time_unit: "s" }, isTime = true, focusInput = true }) {
    
    useEffect(() => {
        if (focusInput) {
            const el = document.getElementById("numeric-value-input")
            el.focus()
        }
        
    }, [])

    return <div className="flex" style={{width : "700px"}}>
        
        <div style={{ minWidth: "8rem" }}>
            {unit.text} {isTime ? `(${selection.time_unit})` : `(${unit.unit})`}:
        </div>
        <Combobox
            value={_.has(selection,"prefix")?selection.prefix:"NA"}
            minQueryLength={0}
            onChange={(item) => onValueChange(item.text,unit,true,false)}
            items={_.keys(prefixes).map(prefixName => { return { text: prefixName, description: prefixes[prefixName] } })}
            labelKey="description" />
        {isTime ?
         <Combobox
            value={selection.time_unit}
            minQueryLength={0}
            onChange={(item) => onValueChange(item.text,unit,false,true)}
            items={TIME_UNITS}
            labelKey="description" />
            : null}
        <NumericInput small minimal fill id="numeric-value-input"  placeholder="Enter value.." value={selection.value} buttonPosition="none" onValueChange={(number, numberAsString) => onValueChange(numberAsString, unit)}/>
        
    </div>

}