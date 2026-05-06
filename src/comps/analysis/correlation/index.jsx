import { useState } from "react"
import PropType from "prop-types"
import { FeatureInput } from "../../core/input/api/FeatureInput"
import _ from "lodash"
import { Combobox } from "../../core/input/Combobox"

import { useOutletContext } from "react-router"
import NumericValueInput from "../../core/input/Numeric"
import { Button } from "@blueprintjs/core"
import { useGetFeatureCorrelationInDataset } from "../../../hooks/queries/datasets.hooks"
import { Protein } from "../../core/base/protein/Protein"
import { addItemToArrayOrRemoveIfPresentByTag } from "../../../services/arrays/transforms"



CorrelationDefinition.propType = {
    submission_tag: PropType.string.isRequired,
    onChange: PropType.func.isRequired,
    selection: PropType.object
}

CorrelationDefinition.defaultProps = {
    selection : {}
}

/**
 * 
 * @param {Object} param0 
 * @returns 
 */
function CorrelationDefinition({ submission_tag, onChange, selection }) {
    const hasFilter = _.isObject(selection.filter)

    return (<div className="flex flex-column">
        
    
            <div style={{ width: "20vw" }}>
            <div>Correlation direction</div>
        <Combobox
            callbackKey="direction"
            value={_.has(selection,"direction.text")?selection.direction.text:""}
            items={[{ text: "both" }, { text: "positive" }, { text: "negative" }]}
                    onChange={onChange} />
        </div>
        <div>Apply protein filter</div>
        <div className="flex">
        {/* <FilterInput {...{
                submission_tag,
                minimal : false,
                selectedItems: hasFilter ? [selection.filter] : [],
                onItemSelect : (cb,filter) => onChange(cb,filter)
            }} /> */}
        <Button minimal icon={"reset"} onClick={() => onChange("filter",undefined)}/>
        </div>
        <NumericValueInput hint="Top N Correlated features" minValue={0} maxValue={400} value={selection.limit} callbackKey="limit" placeholder="Top N correlated features" onChange={(cb,value) => onChange(cb,value)}/>
        {/* onItemSelect={(callbackKey, filter) => setSelection(prevValues => { return { ...prevValues, [callbackKey]: filter } })} />     */}
    </div>)
}

/**
 * @description Component to display correlation of a specific feature to all other features
 * within(!) a given dataset. 
 * @returns
 */
function SubmissionFeatureCorrelation({ }) {
    
    const { submission_tag, metadata, } = useOutletContext()  
    const [correlation, setCorrelation] = useState({limit : 20, direction : {text : "positive"}})
    const featureDefined = _.has(correlation, "feature") && _.isArray(correlation.feature) && correlation.feature.length > 0 

    const { data, isLoading, isFetching, isSuccess, refetch } = useGetFeatureCorrelationInDataset({
                                submission_tag,
                                direction: _.has(correlation,"direction.text") ? correlation.direction.text : undefined,
                                feature_tag: featureDefined ? correlation.feature[0].tag : undefined,
                                filter_tag: _.has(correlation,"filter") && _.isObject(correlation.filter) ? correlation.filter.tag : undefined,
                                limit: correlation.limit}, { enabled : false})
    
    const onCorrelationChange = (cbkey, cbvalue) =>
    {
        setCorrelation(prevValues => {return {...prevValues, [cbkey] : cbvalue}})
    }

    const handleFeatureSelection = (a, feature) => {
        if (!_.has(correlation,"feature") || !_.isObject(correlation.feature)){
            setCorrelation(prevValues => { return { ...prevValues, "feature": [feature] } })
        }
        else if (_.isArray(correlation.feature)){
            const updated_features = addItemToArrayOrRemoveIfPresentByTag({ array: correlation.feature, item: feature })
            setCorrelation(prevValues => { return { ...prevValues, "feature": updated_features } })
        }
    }


    return <div >
        <h2>Correlation Analysis</h2>
        <div>If you define two featuers, then the overlap will be highlighted.</div>
        {_.isObject(metadata) ? <div style={{width : "20vw"}}>
            <FeatureInput
                proteome_tags={metadata.proteome_tags}
                
                selectedItems={featureDefined ? correlation.feature : []}
                onItemSelect={handleFeatureSelection} />
            
            
                <CorrelationDefinition
                    submission_tag={submission_tag}
                    onChange={onCorrelationChange}
                    selection={correlation} /> 
           
        </div> : null}

        <Button text="Submit" intent="primary" onClick={refetch} loading={isFetching || isLoading} disabled={ !featureDefined} />
        
        {isSuccess && _.isArray(data) ? <div style={{height : "70vh", overflowY : "scroll"}}>
            <h3>Results</h3>
            <div></div>
            {data.map(p => <div className="flex"><Protein tag={p.tag} />{`${p.pearson}`}</div>)}
            
            
            </div> : null} 
    </div>
}



export default SubmissionFeatureCorrelation