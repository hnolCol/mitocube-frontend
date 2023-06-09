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
        groupItems = { "Treatment": ["A", "B","WT"], "Time": ["A1", "B1"] },
        groupingNames = ["Treatment", "Time"],
        confirmButtonText = "Show volcano.",
        callback } = props
    
    const [grouping, setGrouping] = useState({
        main: undefined,
        group1: undefined,
        group2: undefined,
        mainItems: [],
        withinGroupings: [],
        withinGroup: undefined,
        imputation: undefined,
        preimputationfilter: undefined
        
    })
                        
    const handleMainGroupingSelection = (groupingName) => {
        const itemsForSelection = groupItems[groupingName]
        const withinGroupings = _.filter(groupingNames, o => o !== groupingName)
        const detectedControl = findControl({groupNames : itemsForSelection})
        const autoSelectControl = itemsForSelection.length > 1 && detectedControl !== undefined


        setGrouping(prevValues => {
            return {
                ...prevValues,
                main: groupingName,
                group1: autoSelectControl ? itemsForSelection.filter(item => item !== detectedControl)[0] : itemsForSelection[0],
                group2: autoSelectControl ? detectedControl : itemsForSelection[1],
                mainItems: itemsForSelection.sort(),
                withinGroupings: _.concat(["None"], withinGroupings),
                withinGrouping: "None",
                withinItems: withinGroupings[0] !== undefined ? groupItems[withinGroupings[0]] : [],
                withinGroup: withinGroupings[0] !== undefined ? groupItems[withinGroupings[0]][0] : "None"
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
        <div className="flex flex-column" style={{ maxWidth: "70%" }}>
            <Header text="Groupings for volcano plot" />
            <p>Select groups to perform pariwise t-test. If the dataset contains more than one grouping (for example Genotype and Treatment) you should probably select a 'within grouping'. Otherwise the second grouping will be ignored.</p>
            
            <Combobox
                callback={handleMainGroupingSelection}
                items={groupingNames}
                placeholder={grouping.main} />
            
            {grouping.main in groupItems ?
                <div className="flex justify-space-between intent-margin-left">
                    <div className="flex center-items" >
                    <div>
                        Group 1:
                    </div>
                    <Combobox 
                        items = {grouping.mainItems} 
                        callback = {handleGroupingChange} 
                        placeholder = {grouping.group1} 
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
                        <div>
                            
                        Group 2:
                    </div>
                    <Combobox 
                            items = {grouping.mainItems} 
                            callback = {handleGroupingChange} 
                            placeholder = {grouping.group2} 
                            callbackKey = "group2"
                            buttonProps ={{minimal : false,
                                        small : true,
                                        intent : "success"
                                        }}/>
                    </div>
                </div>
            
                : null}
           
            {grouping.withinGroupings.length > 1 ?
                <div>
                    <hr width = "100%" className="intent-margin-top"/>
                    <Header text="Within Grouping" />
                <div className="flex center-items">
                    <Combobox 
                        items = {grouping.withinGroupings} 
                        placeholder={grouping.withinGrouping}
                        callback = {handleGroupingChange} 
                        callbackKey="withinGrouping"
                        buttonProps={{
                            minimal: false,
                            small : true,
                            }} />
                        
                    <Combobox     
                        disabled = {grouping.withinGrouping === "None"}
                        items = {grouping.withinItems} 
                        callback = {handleGroupingChange} 
                        placeholder = {grouping.withinGroup} 
                        callbackKey = "withinGroup"
                        buttonProps ={{minimal : false,
                            small : true,
                            intent : "danger"
                            }}/>
                    </div>
                    </div>:
                null}
            <hr width = "100%" className="intent-margin-top"/>
            <Header text="Pre-processing" />
            <div className="flex center-items justify-space-between intent-margin-left">
                <div>
                    Imputation:
                </div>
                <Combobox
                    items={["None", "Downshifted gaussian distribution"]}
                    callbackKey={"imputation"}
                    callback={handleGroupingChange}
                    placeholder = {grouping["imputation"]} 
                    buttonProps={{
                        minimal: false,
                        small : true,
                    }}/>
                                        
                <div>
                    Filter :
                </div>
                <Combobox
                    items={["None", "No missing data in at least one group"]}
                    callbackKey={"preimputationfilter"}
                    callback={handleGroupingChange}
                    placeholder = {grouping["preimputationfilter"]} 
                    buttonProps={{
                        minimal: false,
                        small : true,
                                        }}/>
            </div>
            <div className="intent-margin-top">
                <p>The resulting log2 fold change will be: log2 FC({`${grouping.group1}/${grouping.group2}`})</p>
            </div>
        <Button 
            disabled = {grouping.group1 === grouping.group2} 
            text={confirmButtonText} 
            intent="primary" 
            small={true}
            fill={false}
            onClick = {confirmGroupSelection}/>
        </div>
    )
}

GroupingSelection.propTypes = {
    groupItems: PropTypes.object,
    groupingNames: PropTypes.arrayOf(PropTypes.string),
    confirmButtonText: PropTypes.string,
    callback : PropTypes.func // function to handle the callback (e.g. sends the grouping selection back.)
}

export default GroupingSelection

