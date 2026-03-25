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
            style={{height : "200px"}}
            label={hint}
            labelInfo={isRequired ? "(required) "+lengthHint : "(optional) "}
            inline={false}
            helperText={""}>
           
            <textarea className="textarea" onChange={e => onChange(callbackKey, e.target.value, "text")} multiline={true} rows={10} {...{placeholder,value}} />
        
            </FormGroup>
    )
}

export default TextFieldInput
