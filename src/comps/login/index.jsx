
import { InputGroup, Button } from "@blueprintjs/core"
import PropTypes from "prop-types"
import { Header } from "../core/base/Header"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useLoginUser } from "../../hooks/queries/login.hooks"
import GroupingSelection from "../dataset/volcano/GroupSelection"
import { LineChart } from "../core/charts/linechart"
import { SVGHeader } from "../core/charts/SVG"
import { ParentSize } from "@visx/responsive"
import { ChartLegend } from "../core/charts/legend"


Login.propTypes = {
    setAuthenticationStatus : PropTypes.func,
    inputProps: PropTypes.object
}

function Login({setAuthenticationStatus ,inputProps = { fill: true } }) {
    
    const [userInput, setUserInput] = useState({password : undefined, username : undefined})
    
    const {
        data,
        isSuccess: loginSuccess,
        isFetching: loginFetching,
        isLoading: loginLoading,
        refetch: handleLoginAttempt } = useLoginUser(userInput, { enabled: false })

    useEffect(() => {
        if (loginSuccess) {
            console.log("yippie")
            console.log(data)
        }
    },[data, loginSuccess])


    const handleInputChange = (e) => {
        //save user input to state
        const inputID = e.target.id
        setUserInput(prevValues => {return {...prevValues, [inputID] : e.target.value}})
    }

    return (
        <div className="flex center-items justify-center expand-div">
            <div className="flex flex-column center-items">               
                
            <Header text="Welcome. Please login." />
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
                </div>
        </div>
    )
}


export default Login