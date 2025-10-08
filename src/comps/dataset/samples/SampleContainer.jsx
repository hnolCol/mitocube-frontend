import React from 'react';
import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { SampleItem } from './SampleItem';
// Placeholder for SampleItems component
// Replace this import with the actual SampleItems import in your project
// import SampleItems from './SampleItems';

const sampleData = [
    // Example sample data, replace with your actual data or props
    { id: 1, name: 'Sample 1' },
    { id: 2, name: 'Sample 2' },
    { id: 3, name: 'Sample 3' },
    { id: 4, name: 'Sample 4' },
];




// const SampleItem = ({ sample }) => (
//     <div
//         style={{
//             background: '#f5f5f5',
//             borderRadius: '8px',
//             padding: '16px',
//             textAlign: 'center',
//             boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//         }}
//     >
//         {sample.name}
//     </div>
// );

export function SamplesContainer({ submission_tag }) {

    const { data: sample_tags } = hooks.submissions.samples.useGetSubmissionSampleNames({ tag: submission_tag }, { enabled: !!submission_tag });

    console.log(sample_tags);
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '85vh',
                width: '100%',
            }}
        >
            <div
                style={{
                    display: 'grid',
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

