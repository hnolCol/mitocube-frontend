


import { Button, NumericInput } from "@blueprintjs/core"
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

function NumericValueInput({ callbackKey, value, onChange, hint = "", optional = false, placeholder = "Enter value ..", fill = true, buttonPosition = "none", submitButton = false, onButtonClick = undefined, buttonProps = {}, ...rest}) {
    
    const [valueString, setValue ] = useState("")
    return (
        <div>
            
            <div className="font-size--small">
                {optional?"Optional : ": ""}{`${hint}`}
            </div>
            <div className="flex center-items">
                <NumericInput
                    value={submitButton ? valueString : value} 
                    onKeyUp={submitButton && valueString !== ""? (e) => {
                        if (e.key === "Enter") {
                            console.log("enter")
                            onButtonClick(callbackKey,valueString,"text")
                        }
                    }:undefined}
                    {...{placeholder,fill, buttonPosition}}
                    onValueChange={submitButton ? (value,valueAsString) => setValue(valueAsString) : _.isFunction(onChange) ? (value, valueAsString) => onChange(callbackKey, valueAsString, "text") : undefined}
                    { ...rest}
                />
                {submitButton ? <Button onClick={(e) => onButtonClick(callbackKey, valueString, "text")} {...buttonProps} disabled={valueString === ""}/> : null}
            </div>
        </div>

        
    )
}

export default NumericValueInput