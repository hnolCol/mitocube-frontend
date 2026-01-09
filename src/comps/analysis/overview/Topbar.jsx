import { useEffect, useState } from "react"
import { copyTextToClipboard } from "../../../services/clipboard"
import { useGetSubmissionSampleTags, useGetSubmissionSummaryString } from "../../../hooks/queries/submission.hooks"
import TooltipButton from "../../core/base/buttons/TooltipButton"

import hooks from "@mitocube/api-hooks"

/**
 * @param {Object} props
 * @param {String} props.submission_tag - The submission tag for which the quick access control should be established.
 * @returns 
 */
export function QuickAccessBar({ submission_tag }) {
    
    const [msg, setMsg] = useState()
    const { isLoading : summaryIsLoading, isFetching : summaryIsFetching, isError : isSubmissionSummaryError, refetch: fetchSummaryString } = useGetSubmissionSummaryString(
        { tag: submission_tag },
        {
            enabled: false, //only use refetch function to get the data. 
            onSuccess: data => {
                copyTextToClipboard(data)
                setMsg("Summary string copied to clipboard.")
            }
        })
    
    
    const {isLoading : sampleNamesIsLoading,isFetching : sampleNamesIsFetching, refetch : fetchSampleNames, isError : isSampleNamesError} = hooks.submissions.samples.useGetSubmissionSampleTags({tag : submission_tag},{enabled : false, onSuccess: data => {
        copyTextToClipboard(data)
        setMsg("Samples names copied to clipboard.")
    }
    })
    
    useEffect(() => {
        if (isSubmissionSummaryError) setMsg("Retrieving the submission summary resulted in an error.")
        else if (isSampleNamesError) setMsg("Retrieving the sample names resulted in an error.")
    },[isSubmissionSummaryError, isSampleNamesError])
    
    return (
        <div className="flex flex-column" style={{alignItems:"flex-end",paddingRight:"0.5rem"}}>
            <div className="flex">
            <TooltipButton icon="tag" content="Copy submission tag" onClick={() => {
                    copyTextToClipboard(submission_tag)
                    setMsg("Tag copied!")
                }} />
            <TooltipButton icon="info-sign" content="Tab delimited submission summary to paste in excel. " onClick={() => fetchSummaryString()} loading={summaryIsFetching | summaryIsLoading} />
            <TooltipButton icon="numbered-list" onClick={() => fetchSampleNames()} loading={sampleNamesIsFetching | sampleNamesIsLoading} content = "Tab delimited sample name information."/>
            
        </div>
            <div className="font-size--smallest">{msg}</div>
        </div>
    )
}