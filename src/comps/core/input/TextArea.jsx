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
    const inputCharLength = value.length
    const lengthHint = minLength > 0?value===""?`(min. ${minLength} characters)`:inputCharLength > minLength?"":`(${inputCharLength}/${minLength} characters)`: ""
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
    )
}

export default TextFieldInput