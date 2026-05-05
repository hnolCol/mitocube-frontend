import { Button } from "@blueprintjs/core"
import { useState, useMemo } from "react"
import { useOutletContext } from "react-router"
import { api } from "@/api"
import _ from "lodash"
import APIError from "../../core/error/APIerror"
import Loading from "../../core/base/loading"
import { WellPosition } from "../../core/plate/wellplate"
import { RunlistCreatorDialog } from "@/comps/submission/view/dialogs/RunlistDialog"
import { objectToKeyValueString, arrayObjectsToString, downloadTxtFile  } from "@/services/downloads/txt"


function Run({ run }) {
    return (
        <div className="div--round bg--lightgrey padding--little flex">
            <h5>{run.name}</h5>
            <WellPosition positionLabel={run.position_label} />
            <div>Plate : {run.plate_index}</div>
        </div>
    )
}

function Runlist() {
    
    const { submission_tag } = useOutletContext()
    const [dialogOpen, setDialogOpen] = useState(false)

    const { data: runlist, isLoading, isFetching, isSuccess, isError, error, refetch } =
        api.submissions.runlist.useGetRunlist({ tag: submission_tag })

    const { mutate: deleteRunlist, isLoading: isDeleting } = api.submissions.runlist.useDeleteRunlist({
        onSuccess: () => {
            refetch()
        }
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

    const exportRunlistToTxtFile = () => {
        if (!runlist) return;
        
        let infoString = objectToKeyValueString({ obj: runlist, ignoreKeys: ["runs"] })
        let runString = arrayObjectsToString({ array: runlist.runs})
        downloadTxtFile(`${infoString}\n\n\n${runString}`, `${submission_tag}-${runlist.n_runs}-runs.txt`)
    }
  
    const handleDeleteRunlist = () => {
        if (window.confirm("Are you sure you want to delete this runlist? This action cannot be undone.")) {
            deleteRunlist({ tag: submission_tag })
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
                <h2>Runlist</h2>
                <Button
                    icon="add"
                    text="Generate Runlist"
                    onClick={() => setDialogOpen(true)}
                    disabled={!submission || isSuccess}
                />
            </div>
            <p>Find the analytical runs associated with the projects below.</p>

            {isLoading || isFetching ? <Loading /> :
                isError ? (
                    error?.response?.status === 404 ? (
                        <p className="text--muted">No runlist found.</p>
                    ) : (
                        <APIError error={error} />
                    )
                ) :
                isSuccess ? (
                    <div>
                        <div className="flex center-items justify-space-between">
                            <p><strong>{runlist.n_runs}</strong> runs</p>
                            <div className="flex center-items">
                                <Button 
                                    icon="download" 
                                    text="Download Runlist" 
                                    onClick={exportRunlistToTxtFile}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                <Button 
                                    icon="trash" 
                                    text="Delete Runlist" 
                                    onClick={handleDeleteRunlist}
                                    intent="danger"
                                    loading={isDeleting}
                                    disabled={isDeleting}
                                />
                            </div>
                        </div>
                        <div className="flex flex-column div--expand">
                            {runlist.runs.map(run => <Run key={run.name} run={run} />)}
                        </div>
                    </div>
                ) : null}
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
