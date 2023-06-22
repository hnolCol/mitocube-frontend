import PropTypes from "prop-types"
import { EditableText } from "@blueprintjs/core"



TextFieldInput.propTypes = {
    value : PropTypes.string.isRequired, //control of input
    callbackKey: PropTypes.string.isRequired,
    placeholder : PropTypes.string,
    onChange: PropTypes.func.isRequired,
    optional: PropTypes.bool,
    
}

function TextFieldInput({callbackKey, value, hint, onChange, placeholder, minLength = 0, optional = false}) {

    return (
            <div className="intent-margin-top--little">
            <div className="font-size--small">
                {optional?"Optional : ": ""}{`${hint} ${minLength > 0?`(min. ${minLength} characters)`:""}`}
            </div>
            <div className="bg--lightgrey container--scroll-y-hide-x">
                <EditableText onChange={value => onChange(callbackKey, value, "text")} multiline={true} minLines={5} {...{placeholder,value}} />
            </div>
            </div>
    )
}

export default TextFieldInput