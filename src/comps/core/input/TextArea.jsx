import PropTypes from "prop-types"
import { EditableText, FormGroup } from "@blueprintjs/core"



TextFieldInput.propTypes = {
    value : PropTypes.string.isRequired, //control of input
    callbackKey: PropTypes.string.isRequired,
    placeholder : PropTypes.string,
    onChange: PropTypes.func.isRequired,
    optional: PropTypes.bool,
    
}

function TextFieldInput({callbackKey, value, hint = "", onChange, placeholder = "Click to edit", minLength = 0, isRequired}) {

    const lengthHint = minLength > 0?`(min. ${minLength} characters)`: ""
    return (
        <FormGroup
            label={hint}
            labelInfo={isRequired ? "(required) "+lengthHint : "(optional) "}
            inline={false}
            helperText={""}>
            <div style={{backgroundColor:"#ffffff"}}>
            <EditableText onChange={value => onChange(callbackKey, value, "text")} multiline={true} minLines={5} {...{placeholder,value}} />
            </div>
            </FormGroup>
            // <div className="intent-margin-top--little">
            // <div className="font-size--small">
            //     {optional?"Optional : ": ""}{`${hint} ${minLength > 0?`(min. ${minLength} characters)`:""}`}
            // </div>
            // <div className="bg--white container--scroll-y-hide-x">
                
            // </div>
            // </div>
    )
}

export default TextFieldInput