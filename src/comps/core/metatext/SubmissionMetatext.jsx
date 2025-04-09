import { useGetSubmissionMetatextByTag } from "../../../hooks/queries/submission.hooks"
import { Loading } from "../base/states/Loading"
import { MetatextBox } from "./MetatextBox"
import _ from "lodash"

export function Metatexts({ submission_tag, fill = false }) {
    const { data: metatexts, isSuccess, isLoading, isFetching, isError} = useGetSubmissionMetatextByTag({tag : submission_tag}, { staleTime: Infinity })
    if (isLoading || isFetching) return <Loading />
    if (isError) return <p>Invalid response when getting metadata...</p>
    if (!_.isArray(metatexts)) return null 
    return (
        <div className="flex flex--wrap" style={{ gap: "2rem" }}>
                    
                    
            {metatexts.map(metatext => <div
                className="container--shadow padding--little intent-margin-top--little"
                key = {metatext.tag}>
            
                    <MetatextBox {...{...metatext, width: fill ? "100%" : undefined}} />
        
            </div>)}

        </div>)}

