


import { NumericInput } from "@blueprintjs/core"
import PropTypes from "prop-types"
import _ from "lodash"

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
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder : PropTypes.string,
    optional: PropTypes.bool,
    fill : PropTypes.bool
}

function NumericValueInput({callbackKey, value, onChange, hint = "", optional = false, placeholder = "Enter value ..", fill=true, buttonPosition = "none", ...rest}) {
    return (
        <div>
            <div className="font-size--small">
                {optional?"Optional : ": ""}{`${hint}`}
            </div>
            <div>
                <NumericInput
                    value={value} 
                    {...{placeholder,fill, buttonPosition}}
                    onValueChange={_.isFunction(onChange) ? (value, valueAsString) => onChange(callbackKey, valueAsString, "text") : undefined}
                    { ...rest}
                    />
            </div>
        </div>

        
    )
}

export default NumericValueInput