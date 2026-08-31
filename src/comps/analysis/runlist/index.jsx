import { Button, Tab, Tabs } from "@blueprintjs/core"
import { useState, useMemo, useEffect } from "react"
import { useOutletContext } from "react-router"
import { api } from "@/api"
import _ from "lodash"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { WellPosition } from "../../core/plate/wellplate"
import { RunlistCreatorDialog } from "@/comps/submission/view/dialogs/RunlistDialog"
import { objectToKeyValueString, arrayObjectsToString, downloadTxtFile  } from "@/services/downloads/txt"
import { CreatedAt } from "../../core/metrics/CreatedAt"

function Run({ run }) {
    return (
        <div className="div--round bg--lightgrey padding--medium flex justify-space-between center-items margin--little">
            <div className="flex center-items">
                <WellPosition positionLabel={run.position_label} />
                <div className="margin-left--medium">
                    <div className="font-weight--bold">{run.name}</div>
                    <div className="font-size--small text--muted">Plate {run.plate_index + 1}</div>
                </div>
            </div>
            {run.aggregated_samples?.length > 0 && (
                <div className="text--muted font-size--small">
                    {run.aggregated_samples.length} samples pooled
                </div>
            )}
        </div>
    )
}

function Runlist() {
    
    const { submission_tag } = useOutletContext()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedRlTag, setSelectedRlTag] = useState(null)

    const { data: runlists, isLoading, isFetching, isSuccess, isError, error, refetch } =
        api.submissions.runlist.useGetRunlists({ tag: submission_tag })

    const { mutate: deleteRunlist, isLoading: isDeleting } = api.submissions.runlist.useDeleteRunlist({
        onSuccess: () => refetch()
    })
        
    const { data: samplesFull, isSuccess: samplesFullSuccess } =
        api.submissions.samples.useGetSubmissionSamplesFull(
            { tag: submission_tag },
            { enabled: _.isString(submission_tag), staleTime: 300000 }
        )

    const { data: title } = api.submissions.title.useGetSubmissionTitle(
        { tag: submission_tag },
        { enabled: _.isString(submission_tag) }
    )

    // keep the tab selection pointed at a valid runlist
    useEffect(() => {
        if (!runlists || runlists.length === 0) {
            setSelectedRlTag(null)
            return
        }
        if (!selectedRlTag || !runlists.some(rl => rl.tag === selectedRlTag)) {
            setSelectedRlTag(runlists[0].tag)
        }
    }, [runlists])

    const activeRunlist = useMemo(
        () => runlists?.find(rl => rl.tag === selectedRlTag) ?? null,
        [runlists, selectedRlTag]
    )

    const exportRunlistToTxtFile = (runlist) => {
        if (!runlist) return
        let infoString = objectToKeyValueString({ obj: runlist, ignoreKeys: ["runs"] })
        let runString = arrayObjectsToString({ array: runlist.runs })
        downloadTxtFile(`${infoString}\n\n\n${runString}`, `${submission_tag}-${runlist.tag}-${runlist.n_runs}-runs.txt`)
    }

    const handleDeleteRunlist = (rl_tag) => {
        if (window.confirm("Are you sure you want to delete this runlist? This action cannot be undone.")) {
            deleteRunlist({ tag: submission_tag, rl_tag })
        }
    }


    // Build submission object that RunlistCreatorDialog expects
    const submission = useMemo(() => {
        if (!samplesFullSuccess || !samplesFull) return null

        // Build samples_attributes: {att_compound: {"att_compound:dmso": [0,1,2...]}}
        const samples_attributes = {}
        samplesFull.forEach(sample => {
            Object.entries(sample.attributes || {}).forEach(([attr_tag, trait_tags]) => {
                if (!samples_attributes[attr_tag]) samples_attributes[attr_tag] = {}
                trait_tags.forEach(trait_tag => {
                    if (!samples_attributes[attr_tag][trait_tag]) samples_attributes[attr_tag][trait_tag] = []
                    samples_attributes[attr_tag][trait_tag].push(sample.index)
                })
            })
        })

        // Build attributes: {att_compound: {text: "att_compound", tag: "att_compound"}}
        const attributes = {}
        Object.keys(samples_attributes).forEach(attr_tag => {
            attributes[attr_tag] = { text: attr_tag, tag: attr_tag }
        })

        // Build attribute_values_by_tag: {"att_compound:dmso": {text: "dmso", tag: "att_compound:dmso"}}
        const attribute_values_by_tag = {}
        Object.entries(samples_attributes).forEach(([attr_tag, trait_map]) => {
            Object.keys(trait_map).forEach(trait_tag => {
                attribute_values_by_tag[trait_tag] = {
                    text: trait_tag.split(":").pop(),
                    tag: trait_tag
                }
            })
        })

        return {
            tag: submission_tag,
            label: submission_tag,
            title: title || submission_tag,
            n_samples: samplesFull.length,
            samples_attributes,
            attributes,
            attribute_values_by_tag
        }
    }, [samplesFull, samplesFullSuccess, submission_tag, title])

    return (
        <div className="padding--medium">
            <div className="flex center-items justify-space-between">
                <h2>Runlists</h2>
                <Button
                    icon="add"
                    text="Generate Runlist"
                    onClick={() => setDialogOpen(true)}
                    disabled={!submission}
                />
            </div>
            <p>Find the analytical runs associated with the project below. A submission can have several runlists e.g. if the same samples are measured with two different setups.</p>

            {isLoading || isFetching ? <Loading /> :
                isError ? (
                    error?.response?.status === 404 ? (
                        <p className="text--muted">No runlists found.</p>
                    ) : (
                        <APIError error={error} />
                    )
                ) :
                isSuccess && runlists?.length > 0 ? (
                    <div>
                        <Tabs
                            id="runlist-tabs"
                            selectedTabId={selectedRlTag}
                            onChange={(newTabId) => setSelectedRlTag(newTabId)}
                        >
                            {runlists.map(rl => (
                                <Tab
                                    key={rl.tag}
                                    id={rl.tag}
                                    title={<span>{rl.n_runs} runs (<CreatedAt createdat={rl.created_at} />)</span>}
                                />
                            ))}
                        </Tabs>

                        {activeRunlist && (
                            <div className="margin-top--medium">
                                <div className="flex center-items justify-space-between margin-bottom--medium">
                                    <div>
                                        <h3 className="margin--none">{activeRunlist.n_runs} runs</h3>
                                        <div className="text--muted font-size--small">
                                            {activeRunlist.n_plates} plate{activeRunlist.n_plates > 1 ? 's' : ''} •
                                            {activeRunlist.scrambled ? ' Scrambled' : ' Sequential'} •
                                            {activeRunlist.fractionated ? ` ${activeRunlist.n_fractions} fractions` : ' No fractionation'}
                                        </div>
                                    </div>
                                    <div className="flex center-items">
                                        <Button
                                            icon="download"
                                            text="Download"
                                            onClick={() => exportRunlistToTxtFile(activeRunlist)}
                                            style={{ marginRight: "0.5rem" }}
                                        />
                                        <Button
                                            icon="trash"
                                            text="Delete"
                                            onClick={() => handleDeleteRunlist(activeRunlist.tag)}
                                            intent="danger"
                                            loading={isDeleting}
                                            disabled={isDeleting}
                                        />
                                    </div>
                                </div>
                                <div style={{
                                    maxHeight: '70vh',
                                    overflowY: 'auto',
                                    paddingRight: '0.5rem'
                                }}>
                                    {activeRunlist.runs.map(run => <Run key={run.name} run={run} />)}
                                </div>
                            </div>
                        )}
                    </div>
                ) : <p className="text--muted">No runlists found.</p>}
            {submission && (
                <RunlistCreatorDialog
                    isOpen={dialogOpen}
                    submission={submission}
                    onClose={() => { setDialogOpen(false); refetch() }}
                />
            )}
        </div>
    )
}

export default Runlist