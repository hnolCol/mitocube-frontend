import hooks from "@mitocube/api-hooks";
import { useOutletContext } from "react-router";
import { SamplesContainer } from "./SampleContainer";
export function SubmissionSamples({ }) {
    const { submission_tag } = useOutletContext()   


    // const { data: ca } = hooks.submissions.condition_applications.useGetSubmissionConditionApplication({ tag: submission_tag, group_by_attribute : true }, { enabled: !!submission_tag })
    // console.log(ca, "CA")


    return (<div>
        <h2>Samples</h2>
        <div>Submission tag: <strong>{submission_tag}</strong></div>
        <SamplesContainer submission_tag={submission_tag} />
    </div>)
}