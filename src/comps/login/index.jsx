
import { InputGroup, Button } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { Header } from "../core/base/Header"

import { useEffect, useState } from "react"
import { Link, redirect } from "react-router-dom"
import { useLoginUser } from "../../hooks/queries/login.hooks"
import APIError from "../core/error/APIerror"



Login.propTypes = {
    setAuthenticationStatus : PropTypes.func,
    inputProps: PropTypes.object
}

function Login({setAuthenticationStatus ,inputProps = { fill: true } }) {
    
    const [userInput, setUserInput] = useState({password : undefined, username : undefined})
    
    const {
        data,
        isError: loginIsError,
        error : loginError,
        isSuccess: loginSuccess,
        isFetching: loginFetching,
        isLoading: loginLoading,
        refetch: handleLoginAttempt } = useLoginUser(userInput, { enabled: false })

    useEffect(() => {
        if (loginSuccess) {
            redirect("/welcome")
        }
    },[data, loginSuccess])

    const handleInputChange = (e) => {
        //save user input to state
        const inputID = e.target.id
        setUserInput(prevValues => {return {...prevValues, [inputID] : e.target.value}})
    }
    console.log(loginError)
    return (
        <div className="flex center-items justify-center div--expand">
            <div className="flex flex-column center-items">   
            <div className="flex justify-space-between" style={{width : "50vw"}}>
                <InputGroup
                    id = "username"
                    placeholder="Username (E-Mail)"
                    value={userInput.username}
                    onChange={handleInputChange}
                    {...inputProps} /> 
                <InputGroup
                    id = "password"
                    placeholder="Password"
                    type={"password"}
                    value={userInput.password}
                    onChange={handleInputChange}
                    {...inputProps} /> 
                <Button icon="log-in" intent={"primary"} loading={loginFetching || loginLoading} onClick={handleLoginAttempt}/>
            </div>
            <div className="flex">
                <p>No account yet?</p>
                <Link className="router-link" to="/register">Please create an account.</Link>
                </div>
            
                {loginIsError ? <APIError error={loginError} />:null}
            </div>
            
        </div>
    )
}


export default Login