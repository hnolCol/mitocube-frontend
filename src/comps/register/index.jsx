
import PropTypes from "prop-types"
import { Header } from "../core/base/Header"
import PasswordInput from "../core/input/Password"
import TextFieldInput from "../core/input/TextArea"
import TextInput from "../core/input/Text"
import { Combobox } from "../core/input/Combobox"
import HelpOverlay from "../core/overlay/Helpoverlay"
import NumericValueInput from "../core/input/Numeric"
import { useState } from "react"
import _ from "lodash"
import { Button } from "@blueprintjs/core"
import { Link } from "react-router-dom"

const inputs = {
    password: PasswordInput,
    text: TextInput,
    textArea: TextFieldInput,
    combobox: Combobox,
    numeric : NumericValueInput
}


function getInput({inputType}) {
    
    if (_.has(inputs, inputType))
        return inputs[inputType]

}


function Register({ }) {
    
    const [userDetails, setUserDetails] = useState({})

    const data = [{type : "numeric"},{type : "text"},{type : "textArea"}]

    const handleChange = (callbackKey, value) => {
        //save changes
        setUserDetails(prevValues => {return {...prevValues, [callbackKey] : value}})
    }

    return (
        <div className="flex center-items justify-center div--expand position--relative">
            <HelpOverlay />
            <div className="flex flex-column" style={{maxWidth:"50vw"}}>
            <Header text="Register" fontSize="1.4rem" textTransform="uppercase"/>
                <p>Please enter your details below.  If you have any questions, please use the help on the right or contact us.
                If you have already an account please visit the <Link className="router-link" to="/login">login page</Link>.</p>
            <div className="flex flex-column container--scroll-y-hide-x intent-padding-right--little" style={{maxHeight:"80vh"}}>
                    {data.map(inputProps => {
                        const InputComp = getInput({ inputType: inputProps.type })
                        return (
                            <InputComp {...inputProps} onChange={handleChange} />
                        )
                    })}
                    
                {/* <PasswordInput callbackKey={"password"} onChange={handleChange} />
                <TextFieldInput callbackKey="Research Name" onChange={handleChange} hint="Research Name" value={userDetails["Research Name"]} />
                <TextInput callbackKey="Name" hint="Provide your name" minLength={12} onChange={handleChange}/>
                <Combobox value={_.has(userDetails,"Institute")?userDetails["Institute"].text:undefined} items={[{ text: "Hendrik Nolte", label: "MPI AGE" }]} onChange={handleChange} callbackKey={"Institute"}/>
                <NumericValueInput /> */}
                    
                </div>
                <div className="intent-padding-right--little intent-margin-top--little">
                    <Button text="Submit" fill={true} intent="primary" minimal={false} small={true} />
                </div>
            </div> 
        </div>    
    )
}

export default Register