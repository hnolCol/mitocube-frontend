
import { api } from "@/api";
import _ from "lodash";
import { SampleItem } from './SampleItem';


export function SamplesContainer({ submission_tag, updateTrigger = undefined }) {
    const { data: sample_tags, } = api.submissions.samples.useGetSubmissionSampleTags({ tag: submission_tag }, { enabled: _.isString(submission_tag), staleTime : 600000});

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                height: '85vh',
                width: '100%',
                overflowY: 'scroll',
                paddingBottom: '8rem',
            }}
        >
            <div
                className= "flex flex-column"
                style={{
                    // display: 'flex',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                    width: '90%'
                }}
            >
                {_.isArray(sample_tags) ? sample_tags.map((sample_tag, idx) => (
                    <SampleItem key={`${sample_tag}_${idx}`} tag={sample_tag} submission_tag={submission_tag} updateTrigger={updateTrigger} />
                )) : null}
            </div>
        </div>)
}

