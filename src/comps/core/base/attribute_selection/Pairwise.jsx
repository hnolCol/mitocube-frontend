
import _ from "lodash"
import { useEffect, useState } from "react"
import { Button, Checkbox, Divider, MenuItem, Tooltip } from "@blueprintjs/core"
import GroupIconWithName from "../../svg/icons/chartSelection/Group"
import { TextIconWithName } from "../../svg/icons/chartSelection/Text"
import { addItemToArrayOrRemoveItIfPresent } from "../../../../services/arrays/transforms"
import { FilterInput } from "../../input/api/Filter"
import { useGetMetaSamples } from "../../../../hooks/queries/datasets.hooks"
import { groupListByProperty } from "../../../../services/arrays/groupby"
import Loading from "../loading"

import hooks from "@mitocube/api-hooks" 
import { MinimalAttributeSelection } from "../attributes/MinimalAttributeSelection"
import { AttributeSelection } from "../attributes/AttributeSelection"
import { Attribute } from "../attributes/Attribute"
import PropTypes from "prop-types"
import { Select } from "@blueprintjs/select"
import { ConditionApplicationsView } from "../condition_applications/ConditionApplicationView"
import { arraysEqual } from "../../../../services/arrays/equal"
import { motion } from "framer-motion"
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette"
import { Cell, Column, ColumnHeaderCell, EditableName, Table2 } from "@blueprintjs/table"
import { AnnotationSelectionMenu } from "../annotations/AnnotationSelectionMenu"


CAGroupSelection.propTypes = {
    ca_tags : PropTypes.arrayOf(PropTypes.string).isRequired
}


function AttributeColumn({ columnIndex, attribute_tag }) { 
    const { data: attribute } = hooks.attributes.useGetAttribute({ tag: attribute_tag }, { enabled: _.isString(attribute_tag), staleTime: Infinity })
    return <span style={{textWrap : "pretty"}}>{_.isObject(attribute) ? attribute.text : "..."}</span>
}

function CACellRenderer({ rowIndex, columnIndex, ca_tags, attribute_tag, children }) {
    return <div className="flex margin--little">{ca_tags.map(tag => <ConditionApplicationsView key={tag} tag={tag} />)}</div>

}

export function SampleSelectionTableView({ submission_tag, attribute_tags = [], dependency = [], highlightSampleTagByColor = {"PjbzCDFFcd|20251009_PjbzCDFFcd_01" : "red"} }) {
    
    const { data: ca_attributes, isLoading, isSuccess } = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({ tag: submission_tag }, { enabled: _.isString(submission_tag) })

    const { data : condition_applications} = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : submission_tag, attribute_tags : _.join(attribute_tags,";")}, {enabled : _.isString(submission_tag)}    )

    // console.log(condition_applications, "Condition applications")

    return (<div style={{maxHeight : "20vh", overflowY: "scroll", maxWidth : "500px", overflowX : "scroll"}}>

        {_.isArray(condition_applications) && condition_applications.length > 0 && _.isArray(ca_attributes) ?
            
            <Table2
            enableGhostCells
            rowHeights={_.range(condition_applications.length).map(() => 40)}
            numRows={condition_applications.length}
            enableColumnInteractionBar={true}
            cellRendererDependencies={dependency}
            >

            <Column name="Sample" cellRenderer={(rowIndex, columnIndex) => {
                return <Cell
                key={`sample_tag-${rowIndex}-${columnIndex}`} style={{backgroundColor : highlightSampleTagByColor[condition_applications[rowIndex].tag] || "white"}}>
                {condition_applications[rowIndex].tag}
                </Cell>
            }} />
            {ca_attributes.map(attribute_tag =>
                <Column key={attribute_tag}
                cellRenderer={(rowIndex, columnIndex) =>
                    <Cell key={`${attribute_tag}-${rowIndex}-${columnIndex}`} style={{backgroundColor : highlightSampleTagByColor[condition_applications[rowIndex].tag] || "white"}}>
                    <CACellRenderer ca_tags={condition_applications[rowIndex][attribute_tag]} />
                    </Cell>}
                nameRenderer={() => <AttributeColumn attribute_tag={attribute_tag} />} />)}
            
            
            </Table2>
            : null}
        
        </div>)

}





export function CAGroupSelection({ ca_tags, active = true, selected = [], exclude_tags = [], onConfirm, placeHolder = "Left Group", backgroundColor = undefined}) {
    const handleItemRender = (item, { handleClick, modifiers }) => {
        const isSelected = arraysEqual(item, selected)
        const isExcluded = arraysEqual(item, exclude_tags)
        return (
            <motion.button
                whileHover={isExcluded ? {} : { backgroundColor: HIGHLIGHT_COLOR, color: "#ffffff" }}
                disabled={!active}
                className={isExcluded  ? "basic-button basic-button--excluded flex" : isSelected ? "basic-button basic-button--highlighted flex" : "basic-button flex"}
                style={{ width: "100%" }}
                onClick={handleClick}
            >
                {isSelected ? <span style={{ marginRight: "0.2rem" }}>✓</span> : null}
                {item.map(tag => <ConditionApplicationsView key={tag} tag={tag} />)}
            </motion.button>
        )
    }

    return (
        <div>
            <Select
                items={ca_tags}
                filterable={false}
                closeOnSelect={true}
                itemRenderer={handleItemRender}
                onItemSelect={onConfirm}
            >
                <button className="basic-button" style={_.isString(backgroundColor) ? {backgroundColor } : {}}>
                    {_.isArray(selected) && selected.length > 0
                        ? selected.map(tag => <ConditionApplicationsView key={tag} tag={tag} />)
                        : placeHolder}
                </button>
            </Select>
        </div>
    )
}


export function GroupCASelection({ submission_tag, attribute_tag, onConfirm, pairwiseComp }) {  

    const [rerender, setRerender] = useState(undefined)
    const { data: condition_applications } = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplications({ tag: submission_tag, attribute_tags: attribute_tag }, { enabled: _.isString(submission_tag) && _.isString(attribute_tag) })
    useEffect(() => {

            setRerender([Math.random()])
            
        } , [_.join(pairwiseComp.left,";"),_.join(pairwiseComp.right,";")])

    if (!_.isArray(condition_applications) || condition_applications.length < 1) return <div>No condition applications found for attribute {<Attribute attribute_tag={attribute_tag} />}.</div>
    const uniqueCAValuesJoined = _.uniq(condition_applications.map(ca => _.join(_.get(ca, [attribute_tag]).sort()))) //merge them to get unique values including combinations.
    const uniqueCAValues = uniqueCAValuesJoined.map(ca_tags => _.split(ca_tags, ","))
    
    const sampleTagsByColor = (pairwiseComp.left.length > 0 || pairwiseComp.right.length > 0) ?
        _.fromPairs(condition_applications.map(sampleCA => {
            return [sampleCA.tag, arraysEqual(sampleCA[attribute_tag], pairwiseComp.left) ?
                "#efefef" : arraysEqual(sampleCA[attribute_tag], pairwiseComp.right)
                    ? "#edf8b1" : "white"]
        }))
        : {}
    
    const sampleCountByGroup = condition_applications.reduce((acc, sampleCA) => { 
        const group = arraysEqual(sampleCA[attribute_tag], pairwiseComp.left) ? "left" : arraysEqual(sampleCA[attribute_tag], pairwiseComp.right) ? "right" : "none"
        acc[group] = (acc[group] || 0) + 1
        return acc
    }, {})
   

    if (uniqueCAValuesJoined.length < 2) return <div>Not enough condition application values found for attribute {<Attribute attribute_tag={attribute_tag} />}.</div>
    


    

    return <div>
        <SampleSelectionTableView submission_tag={submission_tag} highlightSampleTagByColor={sampleTagsByColor} dependency={rerender}/>
        {_.isArray(uniqueCAValues) && uniqueCAValues.length > 0 ?
            <div style={{width : "100%"}} className="center-items margin-top--little">
                <div className="flex" style={{ gap: "1rem", justifyContent: "center" }}>
                <CAGroupSelection
                    ca_tags={uniqueCAValues}
                    exclude_tags={pairwiseComp.right}
                    selected={pairwiseComp.left}
                    backgroundColor={"#efefef"}
                    onConfirm={(ca_tags) => onConfirm(ca_tags, "left")} />
                
                <CAGroupSelection
                        ca_tags={uniqueCAValues}

                    exclude_tags={pairwiseComp.left}
                    selected={pairwiseComp.right}
                    backgroundColor={"#edf8b1"}
                    onConfirm={(ca_tags) => onConfirm(ca_tags, "right")}
                    placeHolder="Right Group" />
            </div>
                {_.isObject(sampleCountByGroup) && _.keys(sampleCountByGroup).length > 0 ? <span>Number of selected samples of left <strong>{sampleCountByGroup.left || 0}</strong> and right <strong>{sampleCountByGroup.right || 0}</strong> group.</span> : null}
            </div>
                : null}    

    </div>



}


export function ConditionApplicationSelection({ submission_tag, onConfirm, reset_after_confirm = false, isLoadingData = false }) {
    
    const [attribute, setAttribute] = useState(undefined)
    const [pairwiseComp,setPairwiseComp] = useState({left : [], right : [], impute : false, annotation_tag : undefined})
    const {data : ca_attributes, isLoading, isSuccess } = hooks.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : submission_tag}, {enabled : _.isString(submission_tag)}    )

    const inputIsSufficient = _.isString(attribute)
        && _.isArray(pairwiseComp.left) && pairwiseComp.left.length > 0
        && _.isArray(pairwiseComp.right) && pairwiseComp.right.length > 0


    const handleSelection = (value, key) => {

        setPairwiseComp(prevValues => {
            return {
                ...prevValues,
                [key] : value
            }
        })  
    }

    const handleReset = () => {
        setAttribute(undefined)
        setPairwiseComp({left : [], right : [], impute : false})

    }

    const handleConfirm = () => {
        if (!inputIsSufficient) return null 
        onConfirm({
            sample_attribute_tag: attribute,
            ca_tag_left: _.join(pairwiseComp.left, ";"),
            ca_tag_right: _.join(pairwiseComp.right, ";"),
            impute: pairwiseComp.impute || false,
            annotation_tag: pairwiseComp.annotation_tag
        })
        if (reset_after_confirm) {
            handleReset()
        }

    }

    return <div>
        <h4>Define pairwise comparison</h4>
        {isLoading ? <Loading /> : null}
        {isSuccess ? <div> 
            <span>Select an attribute to define pairwise comparison groups.</span>
        <AttributeSelection attribute_tags={ca_attributes} selected={_.isString(attribute) ? [attribute] : []} onSelect={(attribute_tag) => setAttribute(attribute_tag)} />
        </div> : null}

        
        
        {_.isString(attribute) ?
            
            <div className="margin-top--little"> 
                <span>Select conditions to compare.</span>
                <div className="flex">
                    
                    <GroupCASelection
                        submission_tag={submission_tag}
                        pairwiseComp={pairwiseComp}
                        attribute_tag={attribute}
                        onConfirm={handleSelection}
                        placeHolder="Left Group" />


            </div>

            </div> : null}
        

        {_.isArray(ca_attributes) && ca_attributes.length > 1 ?
            <div className="margin-top--little">
                <span>Define the within conditions.</span>

        
            </div> : null}

        <div className="margin-top--little">
            <h3>Annotation Selection</h3>
            <AnnotationSelectionMenu selected_tags={[pairwiseComp.annotation_tag].filter(t => _.isString(t))} onSelection={(e, tag) => setPairwiseComp(prevValues => { return { ...prevValues, annotation_tag: tag } })} showTags={false} placeholder="Select annotation" />
            <div className="font-size--smallest">Data will be filtered for proteins that are annotated by the selected annotation.</div>
        {inputIsSufficient ? <Tooltip hoverOpenDelay={500} compact={true} inheritDarkTheme={false} content={<div style={{ maxWidth: "14rem", textJustify: "inter-word" }}>Imputation is performed by filtering for proteins that are fully quantified in one group.
            Then NaNs are replaced by random data taken from a downshifted gaussian distribution.
            The downshift equals 1.8 x standard deviation of all features in a sample.
            The width of the gaussian distribution equal 0.3 the original standard deviation.</div>}>
            <Checkbox
                label="Imputation"
                checked={pairwiseComp.impute || false}
                indeterminate={false}
                onChange={() => setPairwiseComp(prevValues => { return { ...prevValues, impute: !prevValues.impute } })} />
            </Tooltip> : null}
        </div>
        <div className="">
        <button className= {inputIsSufficient ? "basic-button" : "basic-button basic-button--excluded"} disabled={!inputIsSufficient} onClick={handleConfirm}>Confirm</button> 
        <button disabled={isLoadingData} onClick={handleReset} className="basic-button margin-top--little">Reset</button>
        </div>

    </div>

}


const initState = {
    sample_attribute_tag: undefined,
    attribute_value_tag_left: undefined,
    attribute_value_tag_right: undefined,
    within_attribute_tag: [],
    within_attribute_value_tag: {},
    impute: false,
    filter : undefined
}
/**
 * 
 * @param {object} props 
 * @param {String} props.submission_tag
 * @param {Fucntion} props.callback - The function to be called after selection. 
 * @param {String} props.callbackText - The text shown on the callback button 
 * @param {Boolean} props.isLoading - If the component should be display in loading state.
 * @returns 
 */
export function AttributePairwiseSelection({submission_tag, callback, callbackText = "Save", isLoading = false }) {

    // const {data : sampleAttributes} = useGetSampleAttributes({submission_tag},{enabled : _.isString(submission_tag)})





    const {data, isLoadingSampleMeta, isFetchingSampleMeta } = useGetMetaSamples({dataset_tag: submission_tag})
    const [selection, setSelection] = useState(initState)
   
    if (!_.isObject(data)) return null 
    if (isLoadingSampleMeta || isFetchingSampleMeta) return <Loading />

    const attributes = data.attributes 
    const attributeValuesByAttributeTag = groupListByProperty(data.attribute_values,"attribute_tag")
    const numberSelection = attributes.length

    const addWithinAttributeToSelection = (key, attribute) => {
        setSelection(prevValues => {
            return {
                ...prevValues,
                [key] : addItemToArrayOrRemoveItIfPresent({array : prevValues.within_attribute_tag, item : attribute})
            }
        })
    }

    const addAttributeToSelection = (key, attribute) => {
        const wasSelected = selection[key] === attribute
        const isMain = key === "sample_attribute_tag"
        if (wasSelected) {
            setSelection(prevValues => {
                return {
                    ...prevValues,
                    [key]: prevValues[key] === undefined,
                    within_attribute_tag: attributes,
                    attribute_value_tag_left: isMain ? undefined : prevValues.attribute_value_tag_left,
                    attribute_value_tag_right : isMain ? undefined : prevValues.attribute_value_tag_right
                }
            })
        }
        else {
            const nonMatchingAttributes = selection.within_attribute_tag.filter(attr => attr.tag !== attribute.tag)
            setSelection(prevValues => {
                return {
                    ...prevValues,
                    [key]: attribute,
                    within_attribute_tag: nonMatchingAttributes,
                    attribute_value_tag_left: isMain ? attributeValuesByAttributeTag[attribute.tag][0] : prevValues.attribute_value_tag_left,
                    attribute_value_tag_right : isMain ? attributeValuesByAttributeTag[attribute.tag][1] : prevValues.attribute_value_tag_right
                }
            })
        }
    }
   
    const addAttributeValueToSelection = (key, attribute, attributeValue, within = false) => {
        if (within) {

            setSelection(prevValues => {
                return {
                    ...prevValues, [key]:
                    {
                        ...prevValues[key],
                        [attribute.tag]: prevValues[key] === attributeValue ? undefined : attributeValue
                    }
                }
            })
        }
        else {
            setSelection(prevValues => {return {...prevValues,[key] : prevValues[key] === attributeValue ? undefined : attributeValue}})
        }
        
    }
    
    const getTextKey = (attribute) => {
        if (!_.isObject(attribute)) return "text"
        return attribute.has_features_value?"gene_name":"text"
    }

    const getPlaceHolderAttribute = (attribute) => {
        return _.isObject(attribute)?attribute.text:"Select attribute..."
    }

    const getPlaceHolderAttributeValue = (attribute, attributeValue) => {
        if (!_.isObject(attribute) || !_.isObject(attributeValue)) return ""
        return attribute.has_features_value ? attributeValue.gene_name : attributeValue.text
    }

    const getTagKeyLabel = (attribute, attributeValue) => {
        //even though attribute values wit
        return attributeValue.tag
    }

    const onSave = () => {
        if (!_.isFunction(callback)) return null 
        const props = {
            impute: selection.impute,
            filter_tag: _.isObject(selection.filter) && _.has(selection.filter, "tag") ?  selection.filter.tag : undefined,
            sample_attribute_tag: selection.sample_attribute_tag.tag,
            attribute_value_tag_left: getTagKeyLabel (selection.sample_attribute_tag,selection.attribute_value_tag_left),
            attribute_value_tag_right: getTagKeyLabel (selection.sample_attribute_tag,selection.attribute_value_tag_right),
            within_attribute_tag: _.isEmpty(selection.within_attribute_value_tag) ? undefined : _.join(selection.within_attribute_tag
                .filter(attribute => _.isObject(selection.within_attribute_value_tag[attribute.tag]))
                .map(attribute => attribute.tag), ";"),
            within_attribute_value_tag: _.isEmpty(selection.within_attribute_value_tag) ? undefined :  _.join(selection.within_attribute_tag
                .filter(attribute => _.isObject(selection.within_attribute_value_tag[attribute.tag]))
                .map(attribute =>getTagKeyLabel(attribute, selection.within_attribute_value_tag[attribute.tag])),";")
        }
        callback(props)
    }


    return (
        <div className="margin--medium" style={{ width: "22rem", backgroundColor: "#efefef" }}>
            
            <h4>Define Pairwise Comparison</h4>
            <GroupIconWithName items={attributes} minimal={false} placeholder={getPlaceHolderAttribute(selection.sample_attribute_tag)} selectedItems={[selection.sample_attribute_tag]} callback={addAttributeToSelection} callbackKey={"sample_attribute_tag"}/>
            {_.isObject(selection.sample_attribute_tag) ? <div className="flex flex-column">
                <div>Define left (L) and right (R) group.</div>
                <div className="flex">
                <TextIconWithName
                    items={attributeValuesByAttributeTag[selection.sample_attribute_tag.tag].filter(attributeValue => attributeValue !== selection.attribute_value_tag_right)}
                    selectedItems={[selection.attribute_value_tag_left]}
                    minimal={false}
                    text = "L"
                    textKey={getTextKey(selection.sample_attribute_tag)}
                    placeholder={getPlaceHolderAttributeValue(selection.sample_attribute_tag,selection.attribute_value_tag_left)}
                    callback={(key,attributeValue) => addAttributeValueToSelection(key,selection.sample_attribute_tag,attributeValue,false)}
                    callbackKey={"attribute_value_tag_left"} />
                <div className="flex flex-column center-items" style={{justifyContent:"center", marginLeft:"0.5rem",marginRight : "0.5rem"}}><div>vs</div></div>
                <TextIconWithName
                    items={attributeValuesByAttributeTag[selection.sample_attribute_tag.tag].filter(attributeValue => attributeValue !== selection.attribute_value_tag_left)}
                    selectedItems={[selection.attribute_value_tag_right]}
                    text = "R"
                    minimal={false}
                    textKey={getTextKey(selection.sample_attribute_tag)}
                    placeholder={getPlaceHolderAttributeValue(selection.sample_attribute_tag,selection.attribute_value_tag_right)}
                    callback={(key,attributeValue) => addAttributeValueToSelection(key,selection.sample_attribute_tag,attributeValue,false)}
                    callbackKey={"attribute_value_tag_right"} />
            </div></div> : null}
            {numberSelection > 1 ? <div className="margin-top--little">
                <Divider />
                <h4>Within Selection</h4>
                {_.range(selection.within_attribute_tag.length + 1).map(idx => {
                    if (idx >= numberSelection - 1) return null 
                    const withinAttribute = selection.within_attribute_tag[idx]
                    return (
                        <div className="flex" key={idx}>
                        <TextIconWithName
                            items={attributes.filter(attribute => selection.sample_attribute_tag !== attribute && !selection.within_attribute_tag.includes(attribute))}
                            selectedItems={[withinAttribute]}
                            minimal = {false}
                            text = "SA"
                            callback={addWithinAttributeToSelection}
                            placeholder={getPlaceHolderAttribute(withinAttribute)}
                            callbackKey={"within_attribute_tag"} />
                        {_.isObject(withinAttribute) ? <TextIconWithName
                            items={attributeValuesByAttributeTag[withinAttribute.tag]}
                            selectedItems={[selection.within_attribute_value_tag[withinAttribute.tag]]}
                            minimal={false}
                            text = "AV"
                            callback={(key,attributeValue) => addAttributeValueToSelection(key,withinAttribute,attributeValue,true)}
                            placeholder={getPlaceHolderAttributeValue(withinAttribute,selection.within_attribute_value_tag[withinAttribute.tag])}
                            textKey={getTextKey(withinAttribute)}
                            callbackKey={"within_attribute_value_tag"} /> : null}
                        </div>
                    )
                })}
                
                <div></div>
            </div> : null}
            <div>
                <Divider />
                <h4>Filter</h4>
                <div>Subsets the dataset considering only the features that are part of the filter.</div>
                <FilterInput
                    minimal={false}
                    selectedItems={_.isObject(selection.filter) ? [selection.filter] : []}
                    onItemSelect={(callbackKey, filter) => setSelection(prevValues => { return { ...prevValues, [callbackKey]: filter } })} />    
            <Divider />
            <Tooltip hoverOpenDelay={500} compact={true} inheritDarkTheme={false} content={<div style={{maxWidth : "14rem", textJustify : "inter-word"}}>Imputation is performed by filtering for proteins that are fully quantified in one group.
                    Then NaNs are replaced by random data taken from a downshifted gaussian distribution.
                    The downshift equals 1.8 x standard deviation of all features in a sample.
                    The width of the gaussian distribution equal 0.3 the original standard deviation.</div>}>
            <Checkbox
                label="Imputation"
                checked={selection.impute}
                indeterminate={false}
                onChange={() => setSelection(prevValues => { return { ...prevValues, impute: !prevValues.impute } })} />
            </Tooltip>
            </div>
            <div className="flex">
            <Button text={callbackText} small={true} minimal={false} fill={true} onClick={onSave} disabled={isLoading} loading={isLoading} />
            <Button icon="reset" onClick={() => setSelection(initState)} intent="danger" small={true}/>
            </div>
            
        </div>
    )

}
