import { InputGroup } from "@blueprintjs/core"
import PropTypes from "prop-types"
import _ from "lodash"


TextInput.propTypes = {
    callbackKey: PropTypes.string.isRequired, 
    hint: PropTypes.string,
    minLength: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    style : PropTypes.object
}

function TextInput({callbackKey,hint = "",onChange, minLength = 0, value, optional, placeholder = "Enter value ..", style = {}}) {
    //Textinput when props are derived from backend.
    const checkForMinLength = minLength > 0 

    if (_.isString(value) && value.length > 0 && checkForMinLength) {
        style["intent"] = _.isString(value) && value.length > 0 && _.isInteger(minLength) ? value.length < minLength - 1  ? "danger" : "success" : "none"
    }
    else if (_.isInteger(minLength) && checkForMinLength) {
        style["intent"] = "none"
    }

    const handleValueChange = (e) => {
        //handle change
        onChange(callbackKey, e.target.value, "text")
    }
    
    return(
        <div>
            <div className="font-size--small">
                {optional?"Optional : ": ""}{`${hint} ${checkForMinLength?`(min. ${minLength} characters)`:""}`}
            </div>
            <div>
                <InputGroup value={value} onChange={handleValueChange} {...{ placeholder }} {...style} />
            </div>
            
        </div>
    )
}


export default TextInput