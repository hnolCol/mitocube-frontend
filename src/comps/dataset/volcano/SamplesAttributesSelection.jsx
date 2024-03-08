import _ from "lodash"
import PropTypes from "prop-types"
import { useState } from "react"
import { Button, Checkbox, Code, FormGroup } from "@blueprintjs/core"

// internal imports
import { Combobox } from "../../core/input/Combobox"
import { Header } from "../../core/base/Header"
import findControl from "../../../services/groupings/findControl"


function getGroupText(group) {

    return _.has(group,"text") ? group.text : _.has(group,"genes") ? _.split(group.genes," ").at(0) : ""
}

SamplesAttributesSelection.propTypes = {
    groupAttributeValues: PropTypes.object,
    attributes: PropTypes.arrayOf(PropTypes.object),
    confirmButtonText: PropTypes.string,
    callback : PropTypes.func // function to handle the callback (e.g. sends the grouping selection back.)
}

/**
 * @description JSX Element that allows the user to select samples attributes for a pairwise comparison. 
 * @param {Object} props 
 * @param {import("../../../types/attributes").Attribute[]} props.attributes - The list of attributes
 * @param {Object<string, import("../../../types/attributes").AttributeValue[]>} props.groupAttributeValues - AttributeTag as key and list of attribute values in values. 
 * @param {Function} props.callback - Function to be called when selection is done. 
 * @param {String} props.confirmButtonText - The text displayed for the confirm button when selection is made. 
 * @param {import("../../../types/submissions").Submission} metadata
 * @returns {import("react").ReactElement} - The JSX React Element
 */
export function SamplesAttributesSelection({attributes, groupAttributeValues = {}, callback, confirmButtonText = "Show Volcano plot.", metadata, isLoading}) {
    
    const [grouping, setGrouping] = useState({
        main: undefined,
        group1: undefined,
        group2: undefined,
        impute : false,
        mainItems: [],
        withinGroupings: [],
        withinGrouping: { name: "None", tag: "none" },
        withinGroup: undefined,
        imputation: undefined,
        preimputationfilter: undefined
        
    })


    const attributesByTag = metadata.attributes
                   
    const withinGrouping = grouping.withinGroupings.length > 1

    const handleMainGroupingSelection = (groupingName) => {
        const itemsForSelection = groupAttributeValues[groupingName.tag]
        const withinGroupings = _.filter(attributes, o => o.tag !== groupingName.tag)
        const detectedControl = undefined //findControl({groupNames : itemsForSelection})
       // const autoSelectControl = itemsForSelection.length > 1 && detectedControl !== undefined
        //console.log(attributes, withinGroupings, itemsForSelection)
        console.log(withinGroupings,withinGroupings[0])
        console.log(groupAttributeValues[withinGroupings[0].tag])
        setGrouping(prevValues => {
            return {
                ...prevValues,
                main: groupingName,
                group1: itemsForSelection[0],
                group2: itemsForSelection[1],
                mainItems: itemsForSelection.sort(),
                withinGroupings: _.concat([{ text: "None", tag: "none" }], withinGroupings),
                withinGrouping: {text: "None", tag: "none" },
                withinItems: withinGroupings[0] !== undefined ? groupAttributeValues[withinGroupings[0].tag] : [],
                withinGroup: withinGroupings[0] !== undefined ?
                    _.has(groupAttributeValues[withinGroupings[0].tag][0], "label") ?
                        groupAttributeValues[withinGroupings[0].tag][0].label :
                        groupAttributeValues[withinGroupings[0].tag][0].tag :
                    { name: "None", tag: "none" }
            }
        })
   
    }
    const handleGroupingChange = (groupKey,groupValue) =>{
        //change state upon grouping selection change
        setGrouping(
            prevValues => {
              return { ...prevValues,[groupKey]:groupValue}}) 
    }


    const confirmGroupSelection = (e) => {
        // callback
        const filteredGrouping = _.pick(grouping, ["group1", "group2", "main", "withinGrouping", "withinGroup", "impute"])
        if (_.isFunction(callback)){
            callback(filteredGrouping)
        }
    }


    return(
        <div className="flex flex-column bg--lightgrey div--round padding--medium" style={{ maxWidth: "30rem" }}>
            <div className="bg--grey padding--medium div--round intent-margin-top--little">
            <h3>Groupings for volcano plot</h3>
            <p>Select groups to perform pairwise t-test. If the dataset contains more than one grouping (for example Genotype and Treatment) you should probably select a 'within grouping'. Otherwise the second grouping will be ignored.</p>
            </div>
            <div className="bg--grey padding--medium div--round intent-margin-top--little">
            <h4>Grouping</h4>
            <Combobox
                onChange={handleMainGroupingSelection}
                items={attributes}
                placeholder={_.isObject(grouping.main)?grouping.main.text:""} />
            
            {_.isObject(grouping.main)?grouping.main.tag in groupAttributeValues ?
                <div className="flex justify-space-around center-items margin-top-bottom--medium ">
                    <div className="flex center-items" >
                    <div className="center-items" style={{minWidth:"4rem"}}>Group 1:</div>
                    <Combobox 
                        items = {grouping.mainItems} 
                                onChange={handleGroupingChange} 
                                formGroupMargin = {false}
                                placeholder={grouping.main.has_features_value ? grouping.group1.key : grouping.group1.text} 
                                textKey={grouping.main.has_features_value ? "key" : "text"}
                                callbackKey="group1"
                                labelKey={grouping.main.has_features_value ? "genes" :"description"}
                        buttonProps ={{minimal : false,
                                        small : true,
                                        intent : "primary"
                                        }}/>
                    </div>
                    <div>
                        <Code> vs </Code>
                    </div>
                    <div className="flex center-items">
                        <div style={{minWidth:"4rem"}}>Group 2:</div>
                        
                        
                    <Combobox 
                            items={grouping.mainItems} 
                            formGroupMargin = {false}
                            onChange = {handleGroupingChange} 
                            placeholder={grouping.main.has_features_value ? grouping.group2.key : grouping.group2.text}
                            callbackKey="group2"
                            textKey={grouping.main.has_features_value ? "key" : "text"}
                            labelKey={grouping.main.has_features_value ? "genes" :"description"}
                            buttonProps ={{minimal : false,
                                        small : true,
                                        intent : "success"
                                        }}/>
                    </div>
                </div>
                
                : null : null}
            </div>
            {withinGrouping ?
                <div>

                <div className="bg--grey div--round padding--medium intent-margin-top--little">
                    
                    <Header text="Within Grouping" hexColor={"#000000"} fontSize="0.85rem"/>
                <div className="flex center-items justify-space-around ">
                    <Combobox 
                        items = {grouping.withinGroupings} 
                        placeholder={grouping.withinGrouping.text}
                        onChange={handleGroupingChange} 
                        formGroupMargin = {false}
                        callbackKey="withinGrouping"
                        
                        fill={false}
                        buttonProps={{
                            minimal: false,
                            small : true,
                            }} />
                        
                    <Combobox     
                        disabled = {grouping.withinGrouping === "None"}
                                items={grouping.withinItems} 
                                formGroupMargin = {false}
                        onChange={handleGroupingChange}
                        placeholder={grouping.withinGrouping.tag === "att_genotype" ? grouping.withinGroup.label : grouping.withinGrouping.has_features_value ? grouping.withinGroup.key : grouping.withinGroup.text}
                        callbackKey="withinGroup"
                        textKey={grouping.withinGrouping.has_features_value ? "key" : "text"}
                        labelKey={grouping.withinGrouping.has_features_value ? "genes" :"description"}
                        fill={false}
                        buttonProps ={{minimal : false,
                            small : true,
                            intent : "danger"
                            }}/>
                    </div>
                    </div>
                    </div>:
                null}
            <div>
                <FormGroup helperText="Imputation is performed by filtering for proteins that are fully quantified in one group. Then NaNs are replaced by random data taken from a downshifted gaussian distribution. The downshift equals 1.8 x standard deviation of all features in a sample. The width of the gaussian distribution equal 0.3 the original standard deviation.">
                    <Checkbox
                        label="Imputation"
                        checked={grouping.impute}
                        indeterminate={false}
                        onChange={() => setGrouping(prevValues => { return { ...prevValues, impute: !prevValues.impute } })}/>
                </FormGroup>
                
            </div>
            {/* <hr width="100%" className="intent-margin-top" /> */}
            {/* <div className="bg--grey div--round padding--medium intent-margin-top--little">
            <Header text="Pre-processing" hexColor={"#000000"} fontSize="0.85rem"/>
                <div className="flex flex-column">
                
                <div className="flex center-items justify-space-between intent-margin-left">
                    <div>
                        Imputation:
                    </div>
                    <Combobox
                        items={["None", "Downshifted gaussian distribution"]}
                        callbackKey={"imputation"}
                        onChange={handleGroupingChange}
                        placeholder = {grouping["imputation"]} 
                        buttonProps={{
                            minimal: false,
                            small : true,
                        }}/>
                    </div>   
                <div className="flex center-items justify-space-between intent-margin-left">    
                <div>
                    Filter:
                </div>
                <Combobox
                    items={["None", "No missing data in at least one group"]}
                    callbackKey={"preimputationfilter"}
                    onChange={handleGroupingChange}
                    placeholder = {grouping["preimputationfilter"]} 
                    buttonProps={{
                        minimal: false,
                        small : true,
                                        }}/>
                </div>
                </div>
            </div> */}
               
            <div className="intent-margin-top--little intent-margin-bottom--little bg--grey padding--medium div--round">
                <p>The resulting log2 fold change will be:</p>
                <div className="flex center-items justify-space-around">
                    
                    {_.isObject(grouping.group1) && _.isObject(grouping.group2) ? <span>log2 FC(<span>{getGroupText(grouping.group1)}</span>/<span>{getGroupText(grouping.group2)}</span>)</span> : null}

                    {/* {_.isObject(grouping.group1) ? <span className="h0-span">log2 FC(<span className="h3-span">{`${grouping.group1.name} / ${grouping.group2.name}`}</span>) <span>{withinGrouping ? `(${grouping.withinGroup.name})` : null}</span></span> : null} */}
                    </div>
            </div>
        <div className="flex justify-space-around">
            <Button 
                    disabled={grouping.group1 === grouping.group2} 
                    loading={isLoading}
                text={confirmButtonText} 
                small={true}
                fill={false}
                        onClick={confirmGroupSelection} />
        </div>
        </div>
    )
}



