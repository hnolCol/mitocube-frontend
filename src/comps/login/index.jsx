
import PropTypes from "prop-types"
import { Header } from "../core/base/Header"

import { useEffect, useState } from "react"
import { useNavigate} from "react-router-dom"
import APIError from "../core/error/APIerror"
import axios from "axios"
import _, { set } from "lodash"
import { checkBasicEmailPattern } from "../../services/checks/email"
import { saveInLocalStorage } from "../../services/localstorage"
import { api } from "../../api"
import QRCode from "react-qr-code"
import { Loading } from "../core/base/states/Loading"


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
    const [mfaSetup, setMFASetup] = useState(false)
    const [userInput, setUserInput] = useState({password : undefined, username : undefined, verificationCode : undefined})
    const [userLoginResponse, setUserLoginResponse] = useState({success : false, token : "", msg : "", mfa_enabled : false})
    
    const { isLoading: mfa_enable_loading, isSuccess: mfa_enable_success, mutate : enableMFA, isError, error } = api.authentication.mfa.useEnableMFA()

    
    
    const {
        data : loginData,
        isSuccess: loginIsSuccess,
        isError: loginIsError,
        error: loginError,
        refetch: handleLoginAttempt } = api.authentication.login.useLoginUser(userInput, {
            enabled: false
        })  
        
    useEffect(() => {
        if (loginIsSuccess) {
            setUserLoginResponse(prevValues => ({ ...prevValues, ...loginData }))
        }
    },[loginIsSuccess])


    const {
        data: verifiedToken,
        isError: verifyTokenIsError,
        isSuccess : verifyTokenIsSuccess,
        error: verfiyTokenError,
        isFetching: verifyTokenIsFetching,
        isLoading: verifyTokenIsLoading,
        mutate: verifyCode } = api.authentication.token.useVerifyToken() //this is either an email code to setup MFA or a code to verify the token via MFA. 
        
    const handleMFASubmit = (code, token) => {
        if (_.isString(code) && code.length === 6) {
            enableMFA({ verifiedMFAToken: token, code: code }, {
                onSuccess: (data) => {
                    
                    if (data.verified) {
                        setAuthenticationStatus({
                            isAuth: data.verified,
                            token: data.token,
                            tag: data.tag,
                            role: data.role,
                            mfa_enabled: data.mfa_enabled
                        })
                        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        saveInLocalStorage({itemName : "token", itemValue : data.token})
                        if (redirectedFrom === "/") {
                            redirect("/index")
                        }
                        else {
                            //go back to the visitited site
                            redirect(redirectedFrom)
                        }
                        setUserInput(prevValues => {return {...prevValues, mfa_code : ""}})
                    }
                }
            })
        }   
    }


    const verifyTokenByMFACode = (code, token) => {

        if (_.isString(code) && code.length === 6) {
            verifyCode({ tokenString: token, verificationCode: code }, {
                onSuccess: (data) => {
       
                    if (data.verified) {
                        setAuthenticationStatus({
                            isAuth: data.verified,
                            token: data.token,
                            tag: data.tag,
                            role: data.role,
                            mfa_enabled: data.mfa_enabled
                        })
                        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                        saveInLocalStorage({itemName : "token", itemValue : data.token})
                        if (redirectedFrom === "/") {
                            redirect("/index")
                        }
                        else {
                            //go back to the visitited site
                            redirect(redirectedFrom)
                        }
                        setUserInput(prevValues => { return { ...prevValues, mfa_code: "" } })
                    }
                    else {
                        alert("The MFA code is invalid. Please try again.")
                        setUserInput(prevValues => { return { ...prevValues, mfa_code: "" } })
                    }
                }

            })
        }
    }

    const handleVerifyToken = () => {
        
        if (_.isString(userInput.verificationCode) && userInput.verificationCode.length > 0 && _.isString(userLoginResponse.token)) {
            verifyCode({ tokenString: userLoginResponse.token, verificationCode: userInput.verificationCode } 
            , {onError: (error) => { console.error(error) } } )
        }
    }

    useEffect(() => {
        
        if (verifyTokenIsSuccess && !verifiedToken.mfa_enabled) {
            
            setMFASetup(true)
        }

    }, [verifyTokenIsSuccess])

    const handleInputChange = (e) => {
        //save user input to state
        const inputID = e.target.id
        setUserInput(prevValues => {return {...prevValues, [inputID] : e.target.value}})
    }

    const loginDisabled = !_.isString(userInput.password) || !_.isString(userInput.username) || userInput.password.length < 3 || !checkBasicEmailPattern(userInput.username)
    const verifyTokenDisabled = !_.isString(userInput.verificationCode) || userInput.verificationCode.length === 0
    const userHasMFAEnabled = _.has(userLoginResponse, "mfa_enabled") && userLoginResponse.mfa_enabled
    const mfaStringEntered = _.has(userInput,"mfa_code") && _.isString(userInput.mfa_code) && userInput.mfa_code.length === 6

    if (mfaSetup) {
        return <div className="flex center-items justify-center div--expand">
            <MFASetup verifiedMFAToken={verifiedToken.token} setAuthenticationStatus={setAuthenticationStatus} redirectedFrom={redirectedFrom} redirect={redirect} handleMFASubmit={handleMFASubmit} />
            </div>
    }
    if (verifyTokenIsLoading || verifyTokenIsFetching) { 
        return <div><Loading /></div>
    }
    
    return (
        <div className="flex center-items justify-center div--expand">
            
            <div className="flex flex-column center-items">  
            
                <div className="margin-bottom--little">
                    <Header text= { userHasMFAEnabled ? "Multi-Factor Authorization Code" : userLoginResponse.success && _.isString(userLoginResponse.token) ? "Verification Code" : "User Login" } />
                </div>
                <span className="margin--little" style={{maxWidth : "min(800px,70vw)"}}>{!userHasMFAEnabled && ((loginIsSuccess && !userLoginResponse.mfa_enabled) || (userLoginResponse.success && _.isString(userLoginResponse.token))) ? <span>MFA is <strong>not enabled for this account.</strong> You will receive an email with a one-time password that allows you to setup the MFA.</span> : ""}</span>
                {
                    userHasMFAEnabled ? <div> 

                        <div className="flex justify-space-between margin-bottom--little" style={{ width: "45vw" }}>
                        <input
                            className="search-input"
                            type="text"
                            key="ver"
                            id = "mfa_code"
                            placeholder="Enter MFA Code ..."
                            value={userInput.mfa_code}
                            onChange={handleInputChange}
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && mfaStringEntered) {
                                    verifyTokenByMFACode(userInput.mfa_code, userLoginResponse.token)
                                }
                            }}
                            {...inputProps} /> 
                         <button
                                style={{
                                    background: "#183A6D",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    marginBottom: "12px",
                                    padding: "12px 12px",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                    cursor: !mfaStringEntered ? "not-allowed" : "pointer",
                                    opacity: !mfaStringEntered ? 0.6 : 1,
                                    marginLeft: "8px",
                                    transition: "background 0.2s"
                                }}
                                // disabled={verifyTokenDisabled}
                                onClick={() => verifyTokenByMFACode(userInput.mfa_code, userLoginResponse.token)}
                                type="button"
                            >
                                →
                            </button>
                        
                    </div>
                    </div> : 
                    
                        userLoginResponse.success && _.isString(userLoginResponse.token) ? 
                    
                    <div className="flex justify-space-between margin-bottom--little" style={{ width: "45vw" }}>
                        <input
                            className="search-input"
                            type="text"
                            key="ver"
                            id = "verificationCode"
                            placeholder="Verification Code ..."
                            value={userInput.verificationCode}
                            onChange={handleInputChange}
                            onKeyUp={(e) => {
                                if (e.key === "Enter" && !verifyTokenDisabled) {
                                    handleVerifyToken()
                                }
                            }}
                            {...inputProps} /> 
                         <button
                                style={{
                                    background: "#183A6D",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    marginBottom: "12px",
                                    padding: "12px 12px",
                                    fontSize: "1rem",
                                    fontWeight: 500,
                                    cursor: verifyTokenDisabled ? "not-allowed" : "pointer",
                                    opacity: verifyTokenDisabled ? 0.6 : 1,
                                    marginLeft: "8px",
                                    transition: "background 0.2s"
                                }}
                                disabled={verifyTokenDisabled}
                                onClick={handleVerifyToken}
                                type="button"
                            >
                                →
                            </button>
                        
                    </div> :
                    <LoginInput {...{handleLoginAttempt, handleInputChange, userInput, loginDisabled, inputProps}} />
                    }

            
                {loginIsError || verifyTokenIsError? <APIError error={verifyTokenIsError?verfiyTokenError:loginError} />:null}
            </div>
            
        </div>
    )
}



export function MFASetup({ verifiedMFAToken, handleMFASubmit }) {
    
    const [mfaCode, setMFACode] = useState("")

    const { data: mfa_setup, isLoading, isSuccess, mutate : setupMFA } = api.authentication.mfa.useSetupMFA({})
    const { isLoading: mfa_enable_loading, isSuccess: mfa_enable_success, mutate, isError, error } = api.authentication.mfa.useEnableMFA()

    useEffect(() => { setupMFA({ verifiedMFAToken }) }, [verifiedMFAToken])
    
    const handleMFACodeSubmit = () => {
        if (_.isString(mfaCode) && mfaCode.length > 0) {
            handleMFASubmit(mfaCode, verifiedMFAToken)
        }
    }
    return <div className="flex flex-column center-items" >
        <h3>Multi-Factor Authentication Setup</h3>
        <span>To setup MFA, please scan the QR code below with your authenticator app (e.g. Google Authenticator, Microsoft Authenticator, etc.) and enter the 6-digit code generated by the app.</span>
        {_.isObject(mfa_setup) && _.has(mfa_setup, "qr_code") && isSuccess ?
            <div className="flex flex-column center-items" style={{ gap: "1rem" }}>
                <QRCode value={mfa_setup.qr_code} size={128} />
                <input className="text-input" type="text" id="mfa_code" value={mfaCode} placeholder="Enter verification code from your authenticator app" onChange={(e) => setMFACode(e.target.value)} />
                <button onClick={handleMFACodeSubmit} disabled={!_.isString(mfaCode) || mfaCode.length === 0 || mfaCode.length !== 6 || mfa_enable_loading}>{mfa_enable_loading ? "Enabling..." : "Login"}</button>
            </div>
        
            : null
            
        }
        {isError ? <APIError error={error} /> : null}
    </div>
}



LoginInput.propTypes = {
    handleLoginAttempt: PropTypes.func.isRequired,
    handleInputChange: PropTypes.func.isRequired,
    userInput: PropTypes.object.isRequired,
    loginDisabled: PropTypes.bool.isRequired,
    inputProps: PropTypes.object
}
export function LoginInput({handleLoginAttempt, handleInputChange, userInput, loginDisabled, inputProps}) {
    
    return (
        <div className="flex justify-space-between margin-bottom--little" style={{ width: "45vw" }}>
                <input
                    className="search-input"
                    type="text"
                    key="user"
                    id = "username"
                    placeholder="Username (E-Mail)"
                    intent={_.isString(userInput.username) && userInput.username.length > 2 ? checkBasicEmailPattern(userInput.username) ? "none" : "danger" : "none"}
                    value={userInput.username}
                    onChange={handleInputChange}
                    {...inputProps} /> 
                <input
                    className="search-input"
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
                    <button
                        style={{
                            background: "#183A6D",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            marginBottom: "12px",
                            padding: "12px 12px",
                            fontSize: "1rem",
                            fontWeight: 500,
                            cursor: loginDisabled ? "not-allowed" : "pointer",
                            opacity: loginDisabled ? 0.6 : 1,
                            marginLeft: "8px",
                            transition: "background 0.2s"
                        }}
                        disabled={loginDisabled}
                        onClick={handleLoginAttempt}
                        type="button"
                    >
                        →
                    </button>
            </div>
    )
}


export default Login

