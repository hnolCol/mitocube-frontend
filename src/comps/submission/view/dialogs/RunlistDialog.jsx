import { Button, Callout, Code, Dialog, DialogBody, DialogFooter, Switch } from "@blueprintjs/core";
import { useState } from "react";
import { useGetSubmissionAttributesByTag, usePostRunlist } from "../../../../hooks/queries/submission.hooks";
import _ from "lodash"
import NumericValueInput from "../../../core/input/Numeric";
import APIError from "../../../core/error/APIerror";
import Loading from "../../../core/base/loading";
import { Combobox } from "../../../core/input/Combobox";
import { WellPlates } from "../../../core/plate/wellplate"
import { getRandomID } from "../../../../services/random";
import { objectToKeyValueString, arrayObjectsToString, downloadTxtFile } from "../../../../services/downloads/txt";
/**
 * 
 * @param {import("../../../../types/submissions").Submission} submission 
 * @param {String} aggregate_on The name of the sample attribute that is used to aggregate the samples on 
 * @param {Number} n_fractions the number of fractions 
 * @returns {Number} The number of runs.
 */
function getNumberOfSamples(submission, aggregate_on = undefined, n_fractions = 1) {
    const samplesAttributesToAggregate= _.has(aggregate_on,"tag") ? _.filter(_.keys(submission.samples_attributes), sampleAttr => sampleAttr === aggregate_on.tag) : []
    //const samplesAttributesToAggregate = _.filter(_.keys(submission.samples_attributes), sampleAttr => _.isObject(aggregate_on) && sampleAttr.tag === aggregate_on.tag)
    const numberAggregatedSamples = samplesAttributesToAggregate.length > 0 ? _.values(submission.samples_attributes[aggregate_on.tag]).length : 0
    if (samplesAttributesToAggregate.length === 0 && n_fractions === 1) return submission.n_samples
    if (samplesAttributesToAggregate.length === 0) return submission.n_samples * n_fractions
    return numberAggregatedSamples * n_fractions
}


const initplateLabel = getRandomID(5)
const init_runprops = {n_fractions : "", fractionate : false, aggregate_on : undefined, rows_first : true, scramble : true, scramble_across_plates : false, plate_format : {rows : 8, columns : 12}}
const initSelectedWells = { isMouseDown: false, selected: [], lastClicked: undefined, fromRectangleSelection: false, rectangleSelectionStarted: undefined, currentRectangleSelection: [] }
const initPlates = {
    activePlateLabel: initplateLabel,
    labels: [initplateLabel],
    plateDimensions: {
        [initplateLabel]: { rows: 8, columns: 12 }
    },
    selectedWells: {
        [initplateLabel]: initSelectedWells
    }
}
/**
 * 
 * @param {Object} props
 * @param {import("../../../../types/submissions").Submission} props.submission
 * @param {Boolean} props.isOpen If the dialog is open. 
 * @param {Function} props.onClose Function that handles a close event. 
 * @returns 
 */
export function RunlistCreatorDialog({ isOpen, submission, onClose }) {

    const { mutate: submitRunlistProps,
        data : runlist,
        isLoading: runlistSubmitIsLoading,
        isFetching: runlistSubmitIsFetching,
        isError: runlistSubmitIsError,
        error: runlistSubmitError,
        isSuccess: runlistSubmitIsSuccess, reset } = usePostRunlist()
    
    const { data: attributesByTag, isLoading, isFetching } = useGetSubmissionAttributesByTag()
    
    const [runlistProps, setRunlistProps] = useState(init_runprops)
    const [plates, setPlates] = useState(initPlates)
    const sampleAttributeNames = _.keys(submission.samples_attributes).map(sampleAttrTag => submission.attributes[sampleAttrTag]).map(sampleAttr => { return { text: sampleAttr.text, tag : sampleAttr.tag,  description: `${_.join(_.keys(submission.samples_attributes[sampleAttr.tag]).map(attrValueTag => submission.attribute_values_by_tag[attrValueTag].text), ", ")}` } })
    const runlistLoading = runlistSubmitIsLoading || runlistSubmitIsFetching

    const handleItemChange = (key, value) => {
        setRunlistProps(prevValues => {return {...prevValues, [key] : value}})
    }
    /**
     * 
     * @param {MouseEvent} e Event on close.  
     */
    const handleClose = (e) => {
        resetDialog()
        onClose(e)
    }
    /**
     * @description Resets the dialog window including the plate and aggregate/pooling and well 
     * plate design properties. 
     */
    const resetDialog = () => {
        reset()
        setRunlistProps(init_runprops)
        setPlates(initPlates)
    }

    const handleSubmit = () => {
        //handle sample attribute submit 

        //create plate boolean array which is expected by the API
        const freePlatePositions = plates.labels.map(plateLabel => {
            const { rows: plateRows, columns: plateColumns } = plates.plateDimensions[plateLabel]
            //the selected wells are defined as an integer and hold information about the row and the column 
            const maxDimension = Math.max(plateColumns, plateRows)
            let booleanArray = _.range(plateRows).map(plateRow => _.range(plateColumns).map(plateColumn => false))
            plates.selectedWells[plateLabel].selected.map(positionInteger => {
                //calculate the row and column from the position integer 
                const wellPosition = { row: _.toInteger(positionInteger / maxDimension), column: positionInteger % maxDimension }
                booleanArray[wellPosition.row][wellPosition.column] = true
            })
            return booleanArray
            
        })
        /**
         * @param {Object} runlist_props The runlist props send to the API backend.
         * @param {Boolean} runlist_props.rows_first If rows should be filled first when assigning runs to wells. 
         * @param {String} runlist_props.aggregate_on The string of the samples attributes that is indicating the pooling/aggregation
         * @param {Boolean} runlist_props.fractionate If samples are going to be fractionated.
         * @param {Number} runlist_props.n_fractions The number of fractions. 
         */
        const runlist_props = {
            rows_first: runlistProps.rows_first,
            aggregate_on: _.has(runlistProps,"aggregate_on.tag") ? runlistProps.aggregate_on.tag : undefined,
            fractionate : runlistProps.fractionate,
            scramble: runlistProps.scramble,
            scramble_across_plates: runlistProps.scramble_across_plates,
            n_fractions: runlistProps.n_fractions === "" || !runlistProps.fractionate ? undefined : _.toInteger(runlistProps.n_fractions),
            free_plate_positions: freePlatePositions
        }
        
        submitRunlistProps({ submission_label: submission.label, runlist_props })

    }
    /**
     * @description Exports the runlist to a tab-delimited txt-file. 
     */    
    const exportRunlistToTxtFile = () => {
        let infoString = objectToKeyValueString({ obj: runlist, ignoreKeys: ["runs"] })
        let runString = arrayObjectsToString({ array: runlist.runs})
        //finally download the data
        downloadTxtFile(`${infoString}\n\n\n${runString}`,`${submission.label}-${runlist["runs"].length}-runs.txt`)
        
    }


    return (
        <Dialog style={{ minWidth: "min(920px,95vw)", height: "80vh"}} {...{ isOpen }} title={`Runlist : ${submission.title} (${submission.label})`} onClose={handleClose}>
            {runlistSubmitIsSuccess ? <DialogBody>
                <h3>Runlist Created.</h3>
                <p>Success. The runlist has been created. Please note that if you create another runlist for the submission
                    it will overwrite the old one but a Timeline entry will be created to track the changes.
                    <Button text="Download" onClick={() => exportRunlistToTxtFile()} />
                </p></DialogBody> : runlistLoading ? <Loading /> : runlistSubmitIsError ? <div><APIError error={runlistSubmitError} /></div> :
                <DialogBody><div className="padding--medium">
                    <p>Specify below how to create the run list. Note, that <strong>run and sample are not interchangeable.</strong>. Imagine the sample are fractionated, then there will be multiple <strong>runs</strong> for a single <strong>sample</strong>.
                        Another example, if samples are pooled (<strong>aggregated</strong>), the number of runs is smaller than the number of samples. For this, a sample attribute must be defined that can 
                        be used to indicate pooling (see below for more information).
                    </p>
                    <h3>Sample pooling/aggregation</h3>
                    <div className="flex center-items">
                        <div style={{minWidth: "min(200px,20vw)"}}>
                            <Combobox
                                items={sampleAttributeNames}
                                placeholder="Aggregate samples on..."
                                    callbackKey={"aggregate_on"}
                                textKey="text"
                                labelKey={"description"}
                                matchTargetWidth={false}
                                onChange={(key, item) => handleItemChange(key, item)}
                                value={_.isObject(runlistProps.aggregate_on) ? runlistProps.aggregate_on.text : null} />
                            </div>
                        <div style={{ maxWidth: "min(600px,70vw)", marginLeft: "2rem" }}>
                        <Callout className="">
                            <p>If samples are pooled prior to measurement, you will have to select a samples attribute that is used to aggregate the sample list.
                            As an example, if you used TMT-12plex quantification for 24 samples. This results in 2 pooled runs that contain each 12 samples.
                            Hence, you have to have a samples attributes called for example "TMT-Batch" to assign the samples that will be in the same TMT batch.
                            </p>
                        </Callout>
                        </div>
                    </div>
                    
                    
                    <h3>Fractionation</h3>
                    <div className="flex center-items">
                        <div style={{ minWidth: "min(200px,20vw)" }}>
                        <div>
                        <Switch label="Fractionate"
                            checked={runlistProps.fractionate}
                            onChange={(e) => setRunlistProps(prevValues => {
                                return {
                                    ...prevValues,
                                    "fractionate": !prevValues.fractionate
                                }
                            })} />
                            {runlistProps.fractionate ? <NumericValueInput 
                                callbackKey={"n_fractions"}
                                    minValue={0}
                                    placeholder="Number of fractions.."
                                value={runlistProps.n_fractions}
                                onChange={handleItemChange} /> : null}
                        </div>
                            </div>
                        <div style={{ maxWidth: "min(600px,70vw)", marginLeft: "2rem" }}>
                        <Callout>
                            <p>If your sample is fractionated either by offline methods (high-pH, gel-based) or online methods (CV-FAIMS, GPF)
                            turn fractionation on and provide the number of fractions. The run name will be of format <Code>{`<date:YYYYMMDD>_${submission.label}_..._frac-00X_<run_label>`}</Code>.</p>
                        </Callout>
                        </div>
                    </div>
                    
                    <hr />
                    <h3>Well plate format</h3>
                    <p>The runlist is created for a single or multiple well plates. Here you can define how the runlist should be formatted.</p>
                    <div className="flex center-items">
                        <div className="flex flex-column justify-space-between" style={{minWidth: "min(200px,20vw)",minHeight : "130px"}}>
                            
                                <Switch label="Rows first"
                                checked={runlistProps.rows_first}
                                onChange={(e) => setRunlistProps(prevValues => {
                                    return {
                                        ...prevValues,
                                        rows_first: !prevValues.rows_first
                                    }
                                })} />
                                <Switch label="Scramble"
                                checked={runlistProps.scramble}
                                onChange={(e) => setRunlistProps(prevValues => {
                                    return {
                                        ...prevValues,
                                        scramble: !prevValues.scramble
                                    }
                                })} />
                                <Switch label="Scramble across plates"
                                checked={runlistProps.scramble_across_plates}
                                onChange={(e) => setRunlistProps(prevValues => {
                                    return {
                                        ...prevValues,
                                        scramble_across_plates: !prevValues.scramble_across_plates
                                    }
                                })} />
                           
                        </div>
                        <div style={{ maxWidth: "min(600px,70vw)", marginLeft: "2rem" }}>
                        <Callout>
                            <p>The positions will be calculated filling first
                            the {runlistProps.rows_first ? <strong>rows (A1, A2, A3,...)</strong> :
                            <strong>columns (A1, B1, C1,...)</strong>} for the runs/samples.
                                    In case of fractionation, it is assumed that the fractions are adjacent to another.</p>
                                <p>If <strong>scramble</strong> is enabled, the runs will be created in a random order. It is <strong>highly recommended</strong> to measure runs in random order to reduce time dependent bias.</p>
                                <p>If multiple plates are required to fit all runs, then scrambling is performed within (disabled) or across plates (enabled). The latter is only feasible if your instrumentation cooling cabinet fits multiple plates.</p>
                        </Callout>
                    </div>
                    </div>
                    <div className="intent-margin-top--little">
                    <hr />
                    <h3>Well plate design</h3>
                    <p>In total total of <strong>{getNumberOfSamples(submission, runlistProps.aggregate_on, runlistProps.fractionate ? runlistProps.n_fractions : 1)}</strong> free well plate positions are required. <br/>
                    Current Selection : <strong>{_.sum(_.values(plates.selectedWells).map(selWells => selWells.selected.length))}</strong>.</p>
                    </div>
                    <WellPlates plates={plates} setPlates={setPlates}/>
                </div>
                </DialogBody>}
            
            <DialogFooter  minimal={true} actions={<div>
                <Button text="Submit" onClick={handleSubmit} icon="list" loading={runlistLoading} disabled={runlistLoading} intent="primary"/>
                <Button text="Reset" onClick={resetDialog} icon="reset"/>
                <Button text="Cancel" onClick={handleClose} intent="danger" disabled={runlistLoading}/>
            </div>} />
        </Dialog>
    )
}