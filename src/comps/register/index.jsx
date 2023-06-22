
import PropTypes from "prop-types"
import { Header } from "../core/base/Header"
import PasswordInput from "../core/input/Password"
import TextFieldInput from "../core/input/TextArea"
import TextInput from "../core/input/Text"
import { Combobox } from "../core/input/Combobox"
import HelpOverlay from "../core/overlay/Helpoverlay"


function Register({ }) {
    

    return (
        <div className="flex center-items justify-center expand-div position--relative">
            <HelpOverlay />
            <div className="flex flex-column">
            <Header text="Register" />
                <PasswordInput callbackKey={"password"} onChange={console.log} />
                <TextFieldInput callbackKey="asb" onChange={console.log} hint="Research Name" />
                <TextInput callbackKey="Name" hint="Provide your name" minLength={12} />
                <Combobox items = {[{text : "Hendrik Nolte", label : "MPI AGE"}]}  />
            </div>
        </div>    
    )
}

export default Register