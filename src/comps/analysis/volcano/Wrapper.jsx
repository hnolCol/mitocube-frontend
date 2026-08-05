import APIError from "../../core/error/APIerror";
import _ from "lodash"
import { useState } from "react";

import { Button, Dialog } from "@blueprintjs/core";
import { ConditionApplicationSelection } from "../../core/base/attribute_selection/Pairwise";

import { Combobox } from "@/comps/core/input/Combobox";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";
import { VolcanoDataHandler } from "./DataHandler";
import { PersistentCollapse } from "@/comps/core/base/collapse/Collapse";
import { FavoriteProteinSelection } from "@/comps/core/base/protein/FavoriteProteinSelection";
import { addStringToArrayOrRemove } from "@/services/arrays/transforms";
import { HIGHLIGHT_COLOR } from "@mitocube/viz/src/colors/palette";
import { FavoriteAnnotationSelection } from "@/comps/core/base/annotations/FavoriteAnnotationSelection";
import { Checkbox } from "@/comps/core/base/states/Checkbox";
import { AnnotationDistribution } from "@/comps/admin/annotations/AnnotationDistribution";
import { getItemFromLocalStorage } from "@/services/localstorage";




function HiddenSuffixes({ hiddenSuffixes, setHiddenSuffixes }) {
    const handleRemoveSuffix = (suffix) => {
        setHiddenSuffixes(prevValues => prevValues.filter(s => s !== suffix))
    }
    
    return <Combobox
        placeholder="" items={hiddenSuffixes.map(t => ({ text: t }))}
        onChange={i => handleRemoveSuffix(i.text)}
        noResultsText="No hidden volcanos."
        fill={false}
        buttonProps={{ icon: "eye-off", variant: "minimal", intent: _.isEmpty(hiddenSuffixes) ? "none" : "primary" }} />
}



function ResetVolcanoPlots({ submission_tag, resetVolcanoData }) {
    
    const { itemFound, itemValue } = getItemFromLocalStorage({ itemName: "volcanoProps", parseJson: true })
    const { itemFound : labelsFound, itemValue : labelIndices } = getItemFromLocalStorage({ itemName: "volcanoLabelIndices", parseJson: true })

    if (!itemFound ||!_.has(itemValue, submission_tag)) return null
    const handleReset = () => {
        const newValue = { ...itemValue }
        delete newValue[submission_tag]
        localStorage.setItem("volcanoProps", JSON.stringify(newValue))

        if (labelsFound) {
            const newLabelIndices = { ...labelIndices }
            delete newLabelIndices[submission_tag]
            localStorage.setItem("volcanoLabelIndices", JSON.stringify(newLabelIndices))
        }
        resetVolcanoData()
    }
    return <Button icon="reset" intent="danger" onClick={handleReset} variant="minimal" />
}

const INIT_VOLCANO_DATA = { data: [], testParams: [], selection: [], suffixes: [], initialLabelIndices : new Set() }

export function VolcanoPlotWrapper({ submission_tag }) {
    const [showHoverLabels, setShowHoverLabels] = useState(false)
    const [pairWiseOpen, setPairWiseOpen] = useState(true)
    const [quickSelectOpen, setQuickSelectOpen] = useState({proteins : false, annotations : false, conditions : true})
    const [testParams, setTestParams] = useState({})
    const [hiddenSuffix, setHiddenSuffix] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState({ isOpen: false, message: "" })
    const [volcanoData, setVolcanoData] = useState(INIT_VOLCANO_DATA)
    const [favoriteProteinSelection, setFavoriteProteinSelection] = useState({ values: [], trigger: undefined, key: "tag" })
    const [proteinHoverResults, setProteinHoverResults] = useState({ values: [], trigger: undefined, key: "tag" })
    const [selectedAnnotations, setSelectedAnnotations] = useState([])
    const [favoriteAnnotationSelection, setFavoriteAnnotationSelection] = useState({ values: [], trigger: undefined, key: "tag" })
    const [annotationHoverResults, setAnnotationHoverResults] = useState({ values: [], trigger: undefined, key: "tag" })

    const handleVolcano = (props) => {
        setTestParams({ ...props, _nonce: Date.now() })
    }

    const handleFavoriteSelect = (proteinTag) => {
        setFavoriteProteinSelection(prevValues => { return { ...prevValues, values : addStringToArrayOrRemove({ array: prevValues.values, string: proteinTag }), trigger: Math.random() } })
    }
    const handleProteinHover = (proteinTag) => {

        setProteinHoverResults(prevValues => { return { ...prevValues, values: proteinTag ? [proteinTag] : [], trigger: Math.random() } })
    }

    const handleAnnotationSelection = (annotationTag) => {
        setSelectedAnnotations(prev => addStringToArrayOrRemove({ array: prev, string: annotationTag }))
    }
    
    const handleFavoriteAnnotationSelect = (annotationTag) => {
        setFavoriteAnnotationSelection(prevValues => {
            return { ...prevValues, values: addStringToArrayOrRemove({ array: prevValues.values, string: annotationTag }), trigger: Math.random() }
        })
    }
    
    const handleAnnotationHover = (annotationTag) => {
        setAnnotationHoverResults(prevValues => {
            return { ...prevValues, values: annotationTag ? [annotationTag] : [], trigger: Math.random() }
        })
    }

    const resetVolcanoData = () => {
        setVolcanoData(INIT_VOLCANO_DATA)
        setTestParams({})
        setHiddenSuffix([])
        setFavoriteProteinSelection({ values: [], trigger: undefined, key: "tag" })
        setIsFetching(false)
    }

    return (
        <div className="div--expand flex">
            <Dialog isOpen={error.isOpen} onClose={() => setError({isOpen : false, message : undefined})} title="Error in Volcano Plot Generation">
                <div className="padding--medium">
                    <span>The following error occurred while generating the volcano plot and was returned from the backend.</span>
                    <APIError error={error.message} />
                </div>
            </Dialog>
            <div className="flex" style={{flexGrow : 1, alignContent : "flex-start"}}>
                <div className="padding--medium" style={{height : "90vh"}}>
                    <PersistentCollapse isOpen={pairWiseOpen} duration={0.65} direction="horizontal" horizontalWidth="400px" >
                        
                        <button className="basic-button div--expand margin--little" style={{backgroundColor : HIGHLIGHT_COLOR, color : "white"}}
                            onClick={() => setQuickSelectOpen(prev => ({ ...prev, conditions: !prev.conditions }))}>
                            <span>Volcano Plot Settings</span>
                        </button>

                        <PersistentCollapse isOpen={quickSelectOpen.conditions} direction="vertical" duration={0.65} >        
                            <div className="padding--medium"><ConditionApplicationSelection {...{ submission_tag, onConfirm: handleVolcano, reset_after_confirm: true, isLoadingData: isFetching }} /></div>
                        </PersistentCollapse>


                        <h3>Quick Select</h3>
                        <span>Annotate favorite proteins or annotations in volcano plots.</span>
                        <Checkbox label={"Show hover labels"} checked={showHoverLabels} onChange={() => setShowHoverLabels(prev => !prev)} />
                        <button className="basic-button div--expand margin--little" style={ quickSelectOpen.proteins ? { backgroundColor: HIGHLIGHT_COLOR, color: "white" } : {}} onClick={() => setQuickSelectOpen(prev => ({ ...prev, proteins: !prev.proteins }))}><span>Proteins</span></button>
                            <PersistentCollapse isOpen={quickSelectOpen.proteins} direction="vertical" duration={0.65} >        
                                <FavoriteProteinSelection selected={favoriteProteinSelection.values} submission_tags={[submission_tag]} onSelect={handleFavoriteSelect} onHover={handleProteinHover} />
                        </PersistentCollapse>


                        
                        <button className="basic-button div--expand margin--little" style={quickSelectOpen.annotations ? { backgroundColor: HIGHLIGHT_COLOR, color: "white" } : {}} onClick={() => setQuickSelectOpen(prev => ({ ...prev, annotations: !prev.annotations }))}>
                            <span>Annotations</span>
                        </button>

                        <PersistentCollapse isOpen={quickSelectOpen.annotations} direction="vertical" duration={0.65} >        
                            <FavoriteAnnotationSelection 
                                selected={selectedAnnotations}
                                highlighted={favoriteAnnotationSelection.values}
                                onAdd={handleAnnotationSelection}
                                onSelect={handleFavoriteAnnotationSelect}
                                onHover={handleAnnotationHover} 
                                submission_tags={[submission_tag]}
                            />

                            {annotationHoverResults.values.length > 0 ? <div className="margin--medium">
                                <span>Distribution of hovered annotation in samples:</span>
                                <AnnotationDistribution submission_tag={submission_tag} tag={annotationHoverResults.values[0]} />
                            </div> : null}
                        </PersistentCollapse>               


                    </PersistentCollapse>
                </div>
                <div className="flex margin--medium">
                    <div><Button variant="minimal" icon={pairWiseOpen ? "chevron-left" : "chevron-right"} onClick={() => setPairWiseOpen(prev => !prev)} /></div>
                    <div><HiddenSuffixes hiddenSuffixes={hiddenSuffix} setHiddenSuffixes={setHiddenSuffix} />
                    <ResetVolcanoPlots submission_tag={submission_tag} resetVolcanoData={resetVolcanoData} /></div>
                </div>
                <div className="div--expand">
                    <VolcanoProteinWrapper {...{
                            submission_tag,
                            selectedTestParams: testParams,
                            setIsFetching,
                            onError: setError,
                            hiddenSuffix,
                            volcanoData,
                            setVolcanoData,
                            setHiddenSuffix,
                            favoriteProteinSelection,
                            proteinHoverResults,
                            favoriteAnnotationSelection,
                            annotationHoverResults,
                            showHoverLabels
                    }} />
                    </div>
                </div>
            </div>
    )
}   



export function VolcanoProteinWrapper({ submission_tag, selectedTestParams, setIsFetching, onError, hiddenSuffix, setHiddenSuffix, volcanoData, setVolcanoData, favoriteProteinSelection, proteinHoverResults, favoriteAnnotationSelection, annotationHoverResults, showHoverLabels = false }) {
    const [requiredProteinTags, setRequiredProteinTags] = useState([])
    
    return <WithTagMaps
                Component={VolcanoDataHandler}
                    protein_tags={requiredProteinTags}
                    showProteinSearch={true}
                    proteinSearchProps={{submission_tag}}
                    {...{
                        submission_tag, 
                        volcanoData,
                        setVolcanoData,
                        selectedTestParams,
                        setIsFetching,
                        onError,
                        hiddenSuffix,
                        setHiddenSuffix,
                        setRequiredProteinTags,
                        favoriteProteinSelection,
                        proteinHoverResults,
                        favoriteAnnotationSelection,
                        annotationHoverResults,
                        showHoverLabels
                    }} />
}