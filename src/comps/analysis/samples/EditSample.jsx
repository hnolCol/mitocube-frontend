import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Button, Spinner } from "@blueprintjs/core";
import { SampleAttributeTableWrapper } from "../../submission/new/sample_attributes/select/SamplesAttributeWrapper";
import { render } from "react-dom";
import { api } from "@/api";

function buildReferenceIDs(n) {
    return _.range(n);
}

export function EditSample({ submission_tag, onClose, refetch }) {

    const { data: samplesData, isLoading, isSuccess } = api.submissions.samples.useGetSubmissionSamplesFull(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag), staleTime: 0 }
    );

    const updateSample = api.samples.core.useUpdateSample();
    const [submissionState, setSubmissionState] = useState(null);

    useEffect(() => {
        if (!isSuccess || !_.isArray(samplesData)) return;

        const n = samplesData.length;
        const sampleNames = samplesData.map(s => s.tag);

        // build attribute table from resolved trait_tags
    
        function backendNodeToFrontend(node, id) {
            return {
                type: "attribute",
                tag: node.attribute_tag,
                id,
                children: [
                    {
                        type: "trait",
                        tag: node.trait_tag,
                        id,
                        value: node.value ?? undefined,
                        children: (node.children || []).map(child => backendNodeToFrontend(child, id))
                    }
                ]
            };
        }
    
        const attributeTable = samplesData.map((sample, idx) => {
            const rows = [];
            for (const [attribute_tag, trees] of Object.entries(sample.attributes)) {
                rows.push({
                    type: "attribute",
                    tag: attribute_tag, 
                    id: idx,
                    children: trees.map(tree => ({
                        type: "trait",
                        tag: tree.trait_tag,
                        id: idx,
                        value: tree.value ?? undefined,
                        children: (tree.children || []).map(child => backendNodeToFrontend(child, idx))
                    }))
                });
            }
            return rows;
        });
        const samplesAttributes = _.uniq(
            attributeTable.flatMap(row => row.map(node => node.tag))
        );
    
        const genotypes = samplesData.map(s => s.genotype ? [...s.genotype] : []);
        setSubmissionState({
            tag: submission_tag,
            label: submission_tag,
            sampleNames,
            referenceIDs: buildReferenceIDs(n),
            attributeTable,
            samplesAttributes,
            replicates: samplesData.map(s => s.replicate ?? undefined),
            genotypes,
            datasetAttributeValues: {},
            rerenderTableDependency: [Math.random()],
            n_replicates: _.uniq(samplesData.map(s => s.replicate)).filter(Boolean).length,
        });
    }, [isSuccess, samplesData]);

    function toAttributeTree(node) {
        return {
            tag: node.tag,
            type: node.type,
            value: node.value ?? null,
            children: (node.children || []).map(toAttributeTree)
        };
    }
    
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!submissionState || isSaving) return;
        setIsSaving(true);
        try {
            await Promise.all(
                submissionState.sampleNames.map((tag, idx) =>
                    updateSample.mutateAsync({
                        tag,
                        data: {
                            genotype_tag: submissionState.genotypes[idx]?.[0] || null,
                            condition_applications: submissionState.attributeTable[idx].map(toAttributeTree),
                            replicate: submissionState.replicates[idx] ?? null,
                        }
                    })
                )
            );
            onClose();
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setIsSaving(false);
        }
    };
    if (isLoading || !submissionState) return <Spinner />;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ flex: 1, overflow: "auto" }}>
            <SampleAttributeTableWrapper
                submission={submissionState}
                updateSubmission={(updater) => {
                    setSubmissionState(prev => {
                        const next = typeof updater === "function" ? updater(prev) : updater;
                        const fixedReplicates = next.replicates.map((rep, idx) => 
                            rep === undefined ? prev.replicates[idx] : rep
                        );
                        return {
                            ...next,
                            sampleNames: prev.sampleNames,
                            replicates: fixedReplicates,
                            rerenderTableDependency: [Math.random()]
                        };
                    });
                }}
                numberReplicates={submissionState.n_replicates}
            />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", padding: "1rem", justifyContent: "flex-end", borderTop: "1px solid #e0e0e0" }}>
            <Button text="Save" intent="primary" loading={isSaving} disabled={isSaving} onClick={handleSave} />                
            <Button text="Cancel" intent="danger" onClick={onClose} />
            </div>
        </div>
    );
}