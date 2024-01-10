


import { Button, FormGroup, NumericInput } from "@blueprintjs/core"
import PropTypes from "prop-types"
import _ from "lodash"
import { useState } from "react"

{/* <div>
<div className="font-size--small">
    {optional?"Optional : ": ""}{`${hint} ${checkForMinLength?`(min. ${minLength} characters)`:""}`}
</div>
<div>
    <InputGroup value={value} onChange={handleValueChange} {...{ placeholder }} {...style} />
</div>

</div> */}


NumericValueInput.propTypes = {
    callbackKey: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder : PropTypes.string,
    optional: PropTypes.bool,
    fill : PropTypes.bool
}


/**
 * @description Numeric input that can either be used to simply enter a number in a given range (```minValue```- ```maxValue```) and store it using the ```onChange``` function or a 
 * submit button (```submitButton=True```) can be displayed that needs to be pressed upon the value is entered. Any additional argument will be passed to the @blueprintjs NumericInput Component. 
 * @param {Object} props 
 * @param {Number} props.minValue - The minimum value that the user is allowed to enter. 
 * @param {Number} props.maxValue - The maximum value that the user is allowed to enter. 
 * @param {String} props.value - The selected value which is the string of the text. To find the selected item the ```item[textKey]``` is compared to ```value```.
 * @param {String} props.callbackKey - Optional key that is returned upon selection to help to store the selection by its ```callbackKey```. Please see onChange for more info. 
 * @param {Function} props.onChange - Function to be called when a selection is made. If the ```callbackKey``` is undefined simply the selected item of the ``onChange(item)``` is returned, otherwise ```onChange(callbackKey,item)```. 
 * @param {String} props.placeholder - The place holder string that is displayed to the user if value is undefined. 
 * @param {Boolean} props.isRequired - If true, the user is notified that this field is required. The combobox itself does not perform any checking if it is selected. 
 * @param {String} props.hint - The hint text to be displayed to the user for additional information.  
 * @param {Boolean} props.submitButton - If the true, a button is displayed next to the numeric input form that is used to submit the entered value.
 * @param {Boolean} props.fill - If true the component will expand in the x direction. 
 * 
 * @returns {Element} A JSX Component that allow for numeric input. 
 */
function NumericValueInput({ callbackKey, 
        value, 
        onChange, 
        minValue = -Infinity, 
        maxValue = Infinity, 
        hint = "", 
        isRequired = false, 
        placeholder = "Enter value ..",
        fill = true, 
        buttonPosition = "none", 
        submitButton = false, 
        onButtonClick = undefined, 
        buttonProps = {}, 
        ...rest}) {
            
    const [valueString, setValue] = useState("")
    const valueInRange = _.inRange(_.toNumber(valueString), minValue, maxValue + 1)
    return (
        <FormGroup
            
            label={hint}
            labelInfo={isRequired ? "(required)" : ""}
            inline={false}
            helperText={""}>
            <div className="flex center-items">
            <NumericInput
                    value={submitButton ? valueString : value} 
                    onKeyUp={submitButton && valueString !== "" && valueInRange? (e) => {
                        if (e.key === "Enter") {
                            onButtonClick(callbackKey,valueString,"text")
                        }
                    }:undefined}
                    {...{placeholder,fill, buttonPosition}}
                    onValueChange={submitButton ? (value,valueAsString) => setValue(valueAsString) : _.isFunction(onChange) ? (value, valueAsString) => onChange(callbackKey, valueAsString, "text") : undefined}
                    { ...rest}
                />
            {submitButton ? <div className="flex center-items">
                <Button
                    onClick={(e) => onButtonClick(callbackKey, valueString, "text")}
                    {...buttonProps}
                    disabled={valueString === "" || !valueInRange}
                        text="Save" />
                
                <div>{!valueInRange && valueString !== ""? `Not in range: [${minValue}-${maxValue}]` : ""}</div>
            </div> : null}</div>
            </FormGroup>
    )
}

export default NumericValueInput