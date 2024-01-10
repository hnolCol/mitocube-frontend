import { FormGroup } from "@blueprintjs/core";
import TextInput from "../../input/Text";


function FormLineEdit({
    name = "Email", 
    value = "", 
    placeholder = "",
    helperText ="", 
    isRequired = true, 
    disabled = false, 
    inputDisabled = false, 
    inline=false, 
    onInputChange = undefined, 
    callbackKey = undefined}) {
    
    return (
        <FormGroup
            {...{disabled, inline,helperText}}
            label={name}
            labelInfo={isRequired ? "(required)" : "(optional)"}
            >
            <TextInput onChange={onInputChange} {...{ callbackKey, value, placeholder }} disabled={inputDisabled} />
        </FormGroup>
    )
}

export default FormLineEdit