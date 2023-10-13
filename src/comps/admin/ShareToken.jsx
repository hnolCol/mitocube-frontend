

import PropTypes from "prop-types"
import _ from "lodash"
import APIError from "../core/error/APIerror"
import Loading from "../core/base/loading"
import { useGetShareToken } from "../../hooks/queries/share.token.hooks"
import { Button } from "@blueprintjs/core"
import TextInput from "../core/input/Text"
import { useState } from "react"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Header } from "../core/base/Header"

function ShareToken({ authenticationStatus }) {
    const [sharePassword, setShareTokenPW] = useState("")
    
    const { data,
        isLoading: shareTokenLoading,
        isSuccess,
        isFetching,
        isError,
        error,
        refetch: getShareToken } = useGetShareToken({ tokenString: authenticationStatus.token, sharePassword }, { enabled: false })
    
    const codeSnipped = `
        #python
        import requests
        share_token = """${isSuccess ? data.token : null}""" 
        headers = {'Authorization': f'Bearer {share_token}'}
        data = {} # data to submit
        url = 'https://mitocube.com/api/share'
        response = requests.post(url, json=data, headers=headers)
        `
    const codeSnippedJS = `
        // javascript using axios
        import axios from "axios"
        const res = axios.post("https://mitocube.com/api/share",
            { headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ${isSuccess ? data.token : null}'
                } }
            )
        console.log(res.data)
        `
    return (
        <div className="margin--medium">
            
            <p>A share token can be used to add quality control runs. A app-specific password is required that the system administrator defined.</p>
            <div className="flex center-items">
                <TextInput value={sharePassword} placeholder="Share password." callbackKey="share-pw" onChange={(key, text) => setShareTokenPW(text)} disabled={shareTokenLoading || isFetching} />
                <Button onClick={getShareToken} text="Submit" loading={shareTokenLoading || isFetching} small={true} />
            </div>
            {isSuccess ?
                
                <div style={{ width: "50vw" }}>
                    <p>Share token created. Please find code examples below.</p>
                    <SyntaxHighlighter language={"python"} showLineNumbers={false} style={docco}>
                        {codeSnipped}
                    </SyntaxHighlighter>
                    <SyntaxHighlighter language={"javascript"} showLineNumbers={false} style={docco}>
                        {codeSnippedJS}
                    </SyntaxHighlighter>
                </div> : isError ? <APIError error={error}/> : null}
        </div>
    )
}

export default ShareToken
