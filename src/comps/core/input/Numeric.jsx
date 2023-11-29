


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

function NumericValueInput({ callbackKey, value, onChange, minValue = -Infinity, maxValue = Infinity, hint = "", isRequired = false, placeholder = "Enter value ..", fill = true, buttonPosition = "none", submitButton = false, onButtonClick = undefined, buttonProps = {}, ...rest}) {
    const [valueString, setValue] = useState("")
    const valueInRange = _.inRange(_.toNumber(valueString), minValue, maxValue + 1)
    return (
        <FormGroup
            
            label={hint}
            labelInfo={isRequired ? "(required)" : "(optional)"}
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