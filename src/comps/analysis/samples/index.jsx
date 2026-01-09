import hooks from "@mitocube/api-hooks";
import { useOutletContext } from "react-router";
import { SamplesContainer } from "./SampleContainer";
export function SubmissionSamples({ }) {
    const { submission_tag } = useOutletContext()   


    return (<div className="flex flex-column">
        <h2>Samples</h2>
        <div>Submission tag: <strong>{submission_tag}</strong></div>
        <div><SamplesContainer submission_tag={submission_tag} /></div>
    </div>)
}