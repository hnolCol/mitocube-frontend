
import { InputGroup, Button, Slider, RangeSlider } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { Header } from "../core/base/Header"

import { useEffect, useState } from "react"
import { Link, useNavigate} from "react-router-dom"
import { useLoginUser, useVerifyToken } from "../../hooks/queries/login.hooks"
import APIError from "../core/error/APIerror"
import axios from "axios"
import _ from "lodash"
import { checkBasicEmailPattern } from "../../services/checks/email"
import { saveInLocalStorage } from "../../services/localstorage"

import DescriptionButton from "../core/base/buttons/DescriptionButton"
import InteractiveChart from "../core/charts/interactive"
import { ScatterPlot } from "../core/charts/scatter"
import { ProfileChart } from "../core/charts/profiles/ProfileChart"
import Heatmap from "../core/charts/heatmap"


Login.propTypes = {
    setAuthenticationStatus: PropTypes.func.isRequired,
    redirectedFrom : PropTypes.string,
    inputProps: PropTypes.object
}
/**
 * @description Login JSX Component. 
 * @param {Object} props 
 * @param {Function} props.setAuthenticationStatus - Function to set the authentication status. 
 * @param {string} props.redirectedFrom - If the user is redirected from a specific website, then this url can be used to redirect them back after login.
 * @returns 
 */
function Login({setAuthenticationStatus, redirectedFrom = "/" ,inputProps = { fill: true } }) {
    const redirect = useNavigate()
    const [userInput, setUserInput] = useState({password : undefined, username : undefined, verificationCode : undefined})
    const [userLoginResponse, setUserLoginResponse] = useState({success : false, token : "", msg : ""})
    const {
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
                firstname: verifiedToken.firstname,
                lastname: verifiedToken.lastname,
                label: verifiedToken.label
            })
            saveInLocalStorage({itemName : "token", itemValue : verifiedToken.token})
            axios.defaults.headers.common['Authorization'] = `Bearer ${verifiedToken.token}`;
            if (redirectedFrom === "/") {
                redirect("/index")
            }
            else {
                //go back to the visitited site
                redirect(redirectedFrom)
            }
            
            
        }
    }, [verifyTokenIsSuccess])

    const handleInputChange = (e) => {
        //save user input to state
        const inputID = e.target.id
        setUserInput(prevValues => {return {...prevValues, [inputID] : e.target.value}})
    }

    const loginDisabled = !_.isString(userInput.password) || !_.isString(userInput.username) || userInput.password.length < 3 || !checkBasicEmailPattern(userInput.username)
    const verifyTokenDisabled = !_.isString(userInput.verificationCode) || userInput.verificationCode.length === 0
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
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && !verifyTokenDisabled) {
                                    verifyToken()
                                }
                            }}
                            {...inputProps} /> 
                        <Button
                                key="buttin-verify-token"
                                icon="log-in"
                                intent={"success"}
                                disabled={verifyTokenDisabled}
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
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && !loginDisabled) {
                                    handleLoginAttempt()
                                }
                            }}
                            {...inputProps} /> 
                        <Button
                                icon="log-in"
                                intent={"primary"}
                                disabled={loginDisabled}
                                loading={loginFetching || loginLoading}
                                onClick={handleLoginAttempt} />
                            {/* handleLoginAttempt */}
                    </div>}
            
            {/* <div className="flex">
                <p>No account yet?</p>
                <Link className="router-link" to="/register">Please create an account.</Link>
            </div> */}
            
                {loginIsError || verifyTokenIsError? <APIError error={verifyTokenIsError?verfiyTokenError:loginError} />:null}
            </div>
            
        </div>
    )
}


export default Login