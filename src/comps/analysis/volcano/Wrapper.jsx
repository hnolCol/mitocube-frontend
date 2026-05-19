import APIError from "../../core/error/APIerror";
import _ from "lodash"
import { useState } from "react";

import { Button, Collapse, Dialog } from "@blueprintjs/core";
import { ConditionApplicationSelection } from "../../core/base/attribute_selection/Pairwise";

import { Combobox } from "@/comps/core/input/Combobox";
import { WithTagMaps } from "@/comps/core/prefetch/Prefetch";
import { VolcanoDataHandler } from "./DataHandler";
import { PersistentCollapse } from "@/comps/core/base/collapse/Collapse";
import { FavoriteProteinSelection } from "@/comps/core/base/protein/FavoriteProteinSelection";



export function ProteinSearch({ submission_tag, onSuccess }) {
    
    return <input className="search-input" placeholder="Search for a protein..." onKeyDown={(e) => {
        if (e.key === "Enter") {
            onSuccess(e.target.value)
        }
    }} /> 
}


function HiddenSuffixes({ hiddenSuffixes, setHiddenSuffixes }) {
    const handleRemoveSuffix = (suffix) => {
        setHiddenSuffixes(prevValues => prevValues.filter(s => s !== suffix))
    }
    
    return <Combobox
        placeholder="" items={hiddenSuffixes.map(t => ({ text: t }))}
        onChange={i => handleRemoveSuffix(i.text)}
        noResultsText="No hidden volcanos."
        fill={false}
        buttonProps={{ icon: "eye-off", variant: "minimal", intent: _.isEmpty(hiddenSuffixes) ? "none" : "danger" }} />
}


export function VolcanoPlotWrapper({ submission_tag }) {
    const [pairWiseOpen, setPairWiseOpen] = useState(true)
    const [testParams, setTestParams] = useState({})
    const [hiddenSuffix, setHiddenSuffix] = useState([])
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState({ isOpen: false, message: "" })
    const [volcanoData, setVolcanoData] = useState({ data: [], testParams: [], selection: [], suffixes: [] })
    const handleVolcano = (props) => {
        setTestParams(props)
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
                    <PersistentCollapse isOpen={pairWiseOpen} duration={0.65} direction="horizontal" >
                        <ConditionApplicationSelection {...{ submission_tag, onConfirm: handleVolcano, reset_after_confirm: true, isLoadingData: isFetching }} />

                        <h2>Quick Select</h2>
                        <FavoriteProteinSelection submission_tags={[submission_tag]}/>

                    </PersistentCollapse>
                </div>
                <div className="flex margin--medium">
                    <div><Button variant="minimal" icon={pairWiseOpen ? "chevron-left" : "chevron-right"} onClick={() => setPairWiseOpen(prev => !prev)} /></div>
                    <HiddenSuffixes hiddenSuffixes={hiddenSuffix} setHiddenSuffixes={setHiddenSuffix} />
                </div>
                <div className="div--expand">
                    <VolcanoProteinWrapper {...{
                    submission_tag,
                    selectedTestParams: testParams,
                    setIsFetching,
                    onError: setError,
                    hiddenSuffix,volcanoData, setVolcanoData,
                    setHiddenSuffix
                    }} />
                    </div>
                </div>
            </div>
    )
}   



export function VolcanoProteinWrapper({ submission_tag, selectedTestParams, setIsFetching, onError, hiddenSuffix, setHiddenSuffix, volcanoData, setVolcanoData }) {
    const [requiredProteinTags, setRequiredProteinTags] = useState([])
    
    return <WithTagMaps
                Component={VolcanoDataHandler}
                    protein_tags={requiredProteinTags}
                    showProteinSearch={true}
                    proteinSearchProps={{submission_tag}}
                    {...{
                        submission_tag, 
                        volcanoData, setVolcanoData,
                        selectedTestParams,
                        setIsFetching,
                        onError,
                        hiddenSuffix,
                        setHiddenSuffix,
                        setRequiredProteinTags
                    }} />
}