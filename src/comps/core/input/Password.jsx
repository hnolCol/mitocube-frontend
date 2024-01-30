import PropTypes from "prop-types"
import { Tooltip2 } from "@blueprintjs/popover2"
import { Button, InputGroup } from "@blueprintjs/core"
import { useEffect, useState } from "react"
import _ from "lodash"
import { Tooltip } from "@visx/tooltip"

PasswordInput.propTypes = {
    callbackKey: PropTypes.string, //name to be return on onChange 
    type: PropTypes.string, // type of the input 
    hint: PropTypes.string, //info text presented to the user
    onChange: PropTypes.func.isRequired,
    minLength: PropTypes.number, //length of the password string
    userInput : PropTypes.object
    
}

function PasswordInput({ callbackKey = "pw", hint = "User's password", onChange, minLength = 8, disabled = false, ...rest }) {

    //Default password manager to handle passwords and check that they are equal
    const [pws, setPasswords] = useState({"1" : "", "2" : ""})
    const [rightElements, setRightElements] = useState({"1" : undefined, "2" : undefined}) //icon names to indicate password checks
    
    const handleValueChange = (pwString, inputFieldId) => {
        setPasswords(prevValues => { return { ...prevValues, [inputFieldId]: pwString } })  
    }

    useEffect(() => {
       
        let firstPWExists = _.isString(pws["1"]) && pws["1"].length > 0 
        let secondPWExists = _.isString(pws["2"]) && pws["2"].length > 0
        
        const lengthWarning = (
                    <Tooltip content={`The password must be at least ${minLength} characters long.`}>
                        <Button icon="warning-sign" intent="danger" minimal={true} /> 
                    </Tooltip>)

        let rightElements = { "1": undefined, "2": undefined }
        let pwString = ""
        if (firstPWExists && secondPWExists)
        {
            if (pws["1"].length < minLength - 1) {
                rightElements["1"] = lengthWarning
            }
            else if (pws["1"] !== pws["2"]) {
                rightElements["2"] = <Button icon="not-equal-to" minimal={true} />
            }
            else {
                rightElements["1"] = <Button icon="tick" intent="primary" minimal={true} /> 
                rightElements["2"] = <Button icon="tick" intent="primary" minimal={true} /> 
                //only asing pw to pwString if all looks good.
                pwString=pws["1"]
            }
        }
        else if ((firstPWExists && !secondPWExists) || (!firstPWExists && secondPWExists)) {
            //handle length issue when user types in any of the Inputs.
            if (firstPWExists && pws["1"].length < minLength) {
                rightElements["1"] = lengthWarning
            }
            else if (secondPWExists && pws["2"].length < minLength ) {
                rightElements["2"] = lengthWarning
            }
        }
        setRightElements(rightElements)
        //reset pw string in parent 
        onChange(callbackKey, pwString === ""?undefined:pwString, "text")
        
    },[pws["1"], pws["2"], minLength])


    return (
        <div style={{ width: "100%",paddingTop: "0.5rem" }}>
            <div style={{minHeight:"0.8rem",fontSize:"0.8rem"}}>
                {hint}
            </div>
            {["1", "2"].map(pwKey =>
            {
                return (
                    <div style={{ fontSize: "0px", paddingTop: pwKey === "2" ? "0.2rem" : "0rem" }}>
                        <InputGroup
                            disabled={disabled}
                            placeholder={pwKey === "2" ? "Please repeat password." : "Enter password."}
                            type="password"
                            {...rest}
                            onValueChange={(valueString ) =>  handleValueChange(valueString,pwKey)}
                            rightElement={rightElements[pwKey]} />
                    </div>)
                
            })}
           
        </div>
    )

}


export default PasswordInput