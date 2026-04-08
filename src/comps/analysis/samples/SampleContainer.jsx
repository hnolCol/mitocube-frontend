import React from 'react';
import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { SampleItem } from './SampleItem';
// Placeholder for SampleItems component
// Replace this import with the actual SampleItems import in your project
// import SampleItems from './SampleItems';

export function SamplesContainer({ submission_tag }) {
    const { data: sample_tags, } = hooks.submissions.samples.useGetSubmissionSampleTags({ tag: submission_tag }, { enabled: _.isString(submission_tag) });

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
                    width: '80%'
                }}
            >
                {_.isArray(sample_tags) ? sample_tags.map((sample_tag, idx) => (
                    <SampleItem key={`${sample_tag}_${idx}`} tag={sample_tag} />
                )) : null}
            </div>
        </div>)
}

