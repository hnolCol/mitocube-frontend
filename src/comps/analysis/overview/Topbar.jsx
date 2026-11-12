import { useEffect, useState } from "react"
import { copyTextToClipboard } from "../../../services/clipboard"
import TooltipButton from "../../core/base/buttons/TooltipButton"
import { RequestConsortiumShareButton } from "@/comps/submission/view/RequestConsortiumShareButton"
import { CollaborationRequestsButton } from "@/comps/submission/view/CollaborationRequestsButton"
import { RequestDepositionButton } from "@/comps/submission/view/RequestDepositionButton"
import { SubmissionUpload } from "@/comps/submission/upload/SubmissionFeatureUpload"
import { SubmissionMessagesButton } from "@/comps/submission/view/SubmissionMessagesButton"

import { api } from "@/api";

/**
 * @param {Object} props
 * @param {String} props.submission_tag - The submission tag for which the quick access control should be established.
 * @param {Number|String} [props.userRole] - The role of the current user. Reserved for role-dependent quick access controls.
 * @returns 
 */
export function QuickAccessBar({ submission_tag, userRole }) {
    
    const [msg, setMsg] = useState()

    const { isLoading: sampleNamesIsLoading, isFetching: sampleNamesIsFetching, isError: isSampleNamesError, refetch: fetchSampleNames } = api.submissions.samples.useGetSubmissionSampleTags({ tag: submission_tag }, { enabled: false })

    const handleCopySampleNames = () => {
        fetchSampleNames().then(({ data, status }) => {
            if (status === "error" || data === undefined || data === null) return
            copyTextToClipboard(Array.isArray(data) ? data.join("\n") : data)
            setMsg("Samples names copied to clipboard.")
        })
    }

   

    useEffect(() => {
        if (isSampleNamesError) setMsg("Retrieving the sample names resulted in an error.")
    },[isSampleNamesError])
    
    return (
        <div className="flex flex-column" style={{alignItems:"flex-end",paddingRight:"0.5rem"}}>
            <div className="flex">
            <TooltipButton icon="numbered-list" onClick={handleCopySampleNames} loading={sampleNamesIsFetching || sampleNamesIsLoading} content = "Tab delimited sample name information."/>
            <SubmissionUpload {...{ submission_tag }} />  
            <SubmissionMessagesButton submission_tag={submission_tag} />
            <CollaborationRequestsButton submission_tag={submission_tag} />
            
            <RequestConsortiumShareButton submission_tag={submission_tag} />
            <RequestDepositionButton submission_tag={submission_tag} />
            
            
        </div>
            <div className="font-size--smallest">{msg}</div>
        </div>
    )
}