import _ from "lodash"
import PropTypes from "prop-types"
import { useState } from "react"
import { Button, Code } from "@blueprintjs/core"

// internal imports
import { Combobox } from "../../core/input/Combobox"
import { Header } from "../../core/base/Header"
import findControl from "../../../services/groupings/findControl"

function GroupingSelection(props) {
    const {
        groupAttributeValues = {},
        attributes= [],
        confirmButtonText = "Show Volcano plot.",
        callback } = props
    
    const [grouping, setGrouping] = useState({
        main: undefined,
        group1: undefined,
        group2: undefined,
        mainItems: [],
        withinGroupings: [],
        withinGrouping: { name: "None", tag: "none" },
        withinGroup: undefined,
        imputation: undefined,
        preimputationfilter: undefined
        
    })
                   
    const withinGrouping = grouping.withinGroupings.length > 1
    const handleMainGroupingSelection = (groupingName) => {
        const itemsForSelection = groupAttributeValues[groupingName.tag]
        const withinGroupings = _.filter(attributes, o => o.tag !== groupingName.tag)
        const detectedControl = undefined //findControl({groupNames : itemsForSelection})
        const autoSelectControl = itemsForSelection.length > 1 && detectedControl !== undefined
        console.log(attributes,withinGroupings, itemsForSelection)
        setGrouping(prevValues => {
            return {
                ...prevValues,
                main: groupingName,
                group1: itemsForSelection[0],
                group2: itemsForSelection[1],
                mainItems: itemsForSelection.sort(),
                withinGroupings: _.concat([{ name: "None", tag: "none" }], withinGroupings),
                withinGrouping: { name: "None", tag: "none" },
                withinItems: withinGroupings[0] !== undefined ? groupAttributeValues[withinGroupings[0].tag] : [],
                withinGroup: withinGroupings[0] !== undefined ? groupAttributeValues[withinGroupings[0].tag][0].tag : { name: "None", tag: "none" }
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
        const filteredGrouping = _.pick(grouping, ["group1","group2","main","withinGrouping","withinGroup"])
        if (_.isFunction(callback)){
            callback(filteredGrouping)
        }
    }

    return(
        <div className="flex flex-column bg--lightgrey div--round padding--medium" style={{ maxWidth: "30rem" }}>
            <div className="bg--grey padding--medium div--round intent-margin-top--little">
            <h3>Groupings for volcano plot</h3>
            <p>Select groups to perform pariwise t-test. If the dataset contains more than one grouping (for example Genotype and Treatment) you should probably select a 'within grouping'. Otherwise the second grouping will be ignored.</p>
            </div>
            <div className="bg--grey padding--medium div--round intent-margin-top--little">
            <h4>Grouping</h4>
            <Combobox
                onChange={handleMainGroupingSelection}
                items={attributes}
                placeholder={_.isObject(grouping.main)?grouping.main.name:""} />
            
            {_.isObject(grouping.main)?grouping.main.tag in groupAttributeValues ?
                <div className="flex justify-space-around center-items margin-top-bottom--medium ">
                    <div className="flex center-items" >
                    <div className="center-items" style={{minWidth:"4rem"}}>Group 1:</div>
                        
                    
                    <Combobox 
                        items = {grouping.mainItems} 
                        onChange = {handleGroupingChange} 
                                placeholder={grouping.group1.name} 
                        callbackKey = "group1"
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
                            items = {grouping.mainItems} 
                            onChange = {handleGroupingChange} 
                            placeholder = {grouping.group2.name} 
                            callbackKey = "group2"
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
                        placeholder={grouping.withinGrouping.name}
                        onChange = {handleGroupingChange} 
                        callbackKey="withinGrouping"
                        fill={false}
                        buttonProps={{
                            minimal: false,
                            small : true,
                            }} />
                        
                    <Combobox     
                        disabled = {grouping.withinGrouping === "None"}
                        items = {grouping.withinItems} 
                        onChange = {handleGroupingChange} 
                        placeholder = {grouping.withinGroup.name} 
                        callbackKey="withinGroup"
                        fill={false}
                        buttonProps ={{minimal : false,
                            small : true,
                            intent : "danger"
                            }}/>
                    </div>
                    </div>
                    </div>:
                null}
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
                    {/* {_.isObject(grouping.group1) ? <span className="h0-span">log2 FC(<span className="h3-span">{`${grouping.group1.name} / ${grouping.group2.name}`}</span>) <span>{withinGrouping ? `(${grouping.withinGroup.name})` : null}</span></span> : null} */}
                    </div>
            </div>
        <div className="flex justify-space-around">
            <Button 
                disabled = {grouping.group1 === grouping.group2} 
                text={confirmButtonText} 
                small={true}
                fill={false}
                        onClick={confirmGroupSelection} />
        </div>
        </div>
    )
}

GroupingSelection.propTypes = {
    groupAttributeValues: PropTypes.object,
    attributes: PropTypes.arrayOf(PropTypes.string),
    confirmButtonText: PropTypes.string,
    callback : PropTypes.func // function to handle the callback (e.g. sends the grouping selection back.)
}

export default GroupingSelection

