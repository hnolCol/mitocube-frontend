
import { InputGroup, Button } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { Header } from "../core/base/Header"

import { useEffect, useState } from "react"
import { Link, useNavigate} from "react-router-dom"
import { useLoginUser, useVerifyToken } from "../../hooks/queries/login.hooks"
import APIError from "../core/error/APIerror"

import _ from "lodash"
import { checkBasicEmailPattern } from "../../services/checks/email"

Login.propTypes = {
    setAuthenticationStatus : PropTypes.func,
    inputProps: PropTypes.object
}

function Login({setAuthenticationStatus ,inputProps = { fill: true } }) {
    const redirect = useNavigate()
    const [userInput, setUserInput] = useState({password : undefined, username : undefined, verificationCode : undefined})
    const [userLoginResponse, setUserLoginResponse] = useState({success : false, token : "", msg : ""})



    const {
        data,
        isError: loginIsError,
        error: loginError,
        isSuccess: loginSuccess,
        isFetching: loginFetching,
        isLoading: loginLoading,
        refetch: handleLoginAttempt } = useLoginUser(userInput, { enabled: false, onSuccess : (data) => setUserLoginResponse(data)})

    const {
        data: verifiedToken,
        isError: verifyTokenIsError,
        isSuccess : verifyTokenIsSuccess,
        error: verfiyTokenError,
        isFetching: verifyTokenIsFetching,
        isLoading: verifyTokenIsLoading,
        refetch: verifyToken } = useVerifyToken({verificationCode: userInput.verificationCode, tokenString : userLoginResponse.token},{enabled : false})
    
    
    useEffect(() => {
       
        if (verifyTokenIsSuccess && verifiedToken.success) {
            setAuthenticationStatus({
                isAuth: verifiedToken.verified,
                token: verifiedToken.token,
                role: verifiedToken.role, //user role encoded as integer. 
            })
            redirect("/index")
            
        }
    }, [verifyTokenIsSuccess])

    const handleInputChange = (e) => {
        //save user input to state
        const inputID = e.target.id
        setUserInput(prevValues => {return {...prevValues, [inputID] : e.target.value}})
    }

    return (
        <div className="flex center-items justify-center div--expand">
            
            <div className="flex flex-column center-items">   
                <div className="intent-margin-bottom--little">
                    <Header text="User Login" />
                </div>

                {userLoginResponse.success && _.isString(userLoginResponse.token) ? 
                    
                    
                    <div className="flex justify-space-between intent-margin-bottom--little" style={{ width: "45vw" }}>
                        <InputGroup
                            key="ver"
                            id = "verificationCode"
                            placeholder="Verification Code ..."
                            value={userInput.verificationCode}
                            onChange={handleInputChange}
                            {...inputProps} /> 
                        <Button
                                key="buttin-verify-token"
                                icon="log-in"
                                intent={"success"}
                                disabled={!_.isString(userInput.verificationCode) || userInput.verificationCode.length === 0}
                                loading={verifyTokenIsFetching || verifyTokenIsLoading}
                                onClick={verifyToken} />
                    </div> :
                    
                    <div className="flex justify-space-between intent-margin-bottom--little" style={{ width: "45vw" }}>
                        <InputGroup
                            key="user"
                            id = "username"
                            placeholder="Username (E-Mail)"
                            intent={_.isString(userInput.username) && userInput.username.length > 2 ? checkBasicEmailPattern(userInput.username) ? "none" : "danger" : "none"}
                            value={userInput.username}
                            onChange={handleInputChange}
                            {...inputProps} /> 
                        <InputGroup
                            key="pw"
                            id = "password"
                            placeholder="Password"
                            type={"password"}
                            value={userInput.password}
                            onChange={handleInputChange}
                            {...inputProps} /> 
                        <Button
                                icon="log-in"
                                intent={"primary"}
                                disabled={!_.isString(userInput.password) || !_.isString(userInput.username) || userInput.password.length < 3 || !checkBasicEmailPattern(userInput.username)}
                                loading={loginFetching || loginLoading}
                                onClick={handleLoginAttempt} />
                            {/* handleLoginAttempt */}
                    </div>}
            
            <div className="flex">
                <p>No account yet?</p>
                <Link className="router-link" to="/register">Please create an account.</Link>
                </div>
            
                {loginIsError || verifyTokenIsError? <APIError error={verifyTokenIsError?verfiyTokenError:loginError} />:null}
            </div>
            
        </div>
    )
}


export default Login