
import _ from "lodash"
import { useEffect, useState } from "react"
import {  Checkbox, Tooltip } from "@blueprintjs/core"
import Loading from "../loading"
import { AttributeSelection } from "../attributes/AttributeSelection"
import { Attribute } from "../attributes/Attribute"
import PropTypes from "prop-types"
import { Select } from "@blueprintjs/select"
import { ConditionApplicationsView } from "../condition_applications/ConditionApplicationView"
import { arraysEqual } from "../../../../services/arrays/equal"
import { motion } from "framer-motion"
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette"
import { Cell, Column, Table2 } from "@blueprintjs/table"
import { AnnotationSelectionMenu } from "../annotations/AnnotationSelectionMenu"
import { api } from "@/api"

CAGroupSelection.propTypes = {
    ca_tags : PropTypes.arrayOf(PropTypes.string).isRequired
}


function AttributeColumn({ columnIndex, attribute_tag }) { 
    const { data: attribute } = api.attributes.queryAttributes.useGetAttribute({ tag: attribute_tag }, { enabled: _.isString(attribute_tag), staleTime: Infinity })
    return <span style={{textWrap : "pretty"}}>{_.isObject(attribute) ? attribute.text : "..."}</span>
}

function CACellRenderer({ rowIndex, columnIndex, ca_tags, attribute_tag, children }) {
    return <div className="flex margin--little">{ca_tags.map(tag => <ConditionApplicationsView key={tag} tag={tag} />)}</div>

}

export function SampleSelectionTableView({ submission_tag, attribute_tags = [], dependency = [], highlightSampleTagByColor = {"PjbzCDFFcd|20251009_PjbzCDFFcd_01" : "red"} }) {
    
    const { data: ca_attributes, isLoading, isSuccess } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({ tag: submission_tag }, { enabled: _.isString(submission_tag) })

    const { data : condition_applications} = api.submissions.condition_applications.useGetSubmissionSampleConditionApplications({tag : submission_tag, attribute_tags : _.join(attribute_tags,";")}, {enabled : _.isString(submission_tag)}    )

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

export function GroupCASelection({ submission_tag, attribute_tag, onConfirm, pairwiseComp, withinFilters = {}, onCountChange }) {  


    const withinAttributeTags = _.keys(withinFilters).filter(t => _.isString(t))
    const allAttributeTags = _.uniq([attribute_tag, ...withinAttributeTags]).filter(_.isString)

    const { data: condition_applications } = api.submissions.condition_applications
    .useGetSubmissionSampleConditionApplications(
        { tag: submission_tag, attribute_tags: _.join(allAttributeTags, ";") },
        { 
            enabled: _.isString(submission_tag) && _.isString(attribute_tag),
            staleTime: 0  
        }
    )
    const [rerender, setRerender] = useState(undefined)
    useEffect(() => {
        setRerender([Math.random()])
    }, [_.join(pairwiseComp.left,";"), _.join(pairwiseComp.right,";")])

    const uniqueCAValuesJoined = _.isArray(condition_applications) ? _.uniq(condition_applications.map(ca => _.join(_.get(ca, [attribute_tag]).sort()))) : []
    const uniqueCAValues = uniqueCAValuesJoined.map(ca_tags => _.split(ca_tags, ","))
    
    const sampleTagsByColor = (_.isArray(condition_applications) && (pairwiseComp.left.length > 0 || pairwiseComp.right.length > 0)) ?
    _.fromPairs(condition_applications.map(sampleCA => {
        const isLeft = arraysEqual(sampleCA[attribute_tag], pairwiseComp.left)
        const isRight = arraysEqual(sampleCA[attribute_tag], pairwiseComp.right)

        const hasActiveWithin = _.some(_.values(withinFilters), v => _.isArray(v) && v.length > 0)
        const passesWithin = !hasActiveWithin || _.every(_.keys(withinFilters), attr =>
            !_.isArray(sampleCA[attr]) || withinFilters[attr].length === 0 || arraysEqual(sampleCA[attr], withinFilters[attr])
        )

        if (isLeft && passesWithin) return [sampleCA.tag, "#efefef"]
        if (isRight && passesWithin) return [sampleCA.tag, "#edf8b1"]
        return [sampleCA.tag, "white"]
    })) : {}

    useEffect(() => {
        setRerender([Math.random()])
    }, [_.join(pairwiseComp.left,";"), _.join(pairwiseComp.right,";"), JSON.stringify(withinFilters)])

    const sampleCountByGroup = _.isArray(condition_applications) ? condition_applications.reduce((acc, sampleCA) => { 
        const group = arraysEqual(sampleCA[attribute_tag], pairwiseComp.left) ? "left" : arraysEqual(sampleCA[attribute_tag], pairwiseComp.right) ? "right" : "none"
        acc[group] = (acc[group] || 0) + 1
        return acc
    }, {}) : {}
   
    const withinFilteredCount = _.isArray(condition_applications) ? condition_applications.reduce((acc, sampleCA) => {
        const passesWithin = _.every(_.keys(withinFilters), attr =>
            !_.isArray(sampleCA[attr]) || withinFilters[attr].length === 0 || arraysEqual(sampleCA[attr], withinFilters[attr])
        )
        if (!passesWithin) return acc
        const group = arraysEqual(sampleCA[attribute_tag], pairwiseComp.left) ? "left"
            : arraysEqual(sampleCA[attribute_tag], pairwiseComp.right) ? "right" : "none"
        acc[group] = (acc[group] || 0) + 1
        return acc
    }, {}) : {}

    useEffect(() => {
        if (_.isFunction(onCountChange)) {
            const hasActiveWithin = _.some(_.values(withinFilters), v => _.isArray(v) && v.length > 0)
            onCountChange(hasActiveWithin ? withinFilteredCount : sampleCountByGroup)
        }
    }, [JSON.stringify(withinFilteredCount), JSON.stringify(sampleCountByGroup), JSON.stringify(withinFilters)])

 
    if (!_.isArray(condition_applications) || condition_applications.length < 1) return <div>No condition applications found for attribute <Attribute attribute_tag={attribute_tag} />.</div>
    if (uniqueCAValuesJoined.length < 2) return <div>Not enough condition application values found for attribute <Attribute attribute_tag={attribute_tag} />.</div>

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
            </div>
            : null}    
    </div>
}

export function WithinCASelection({ submission_tag, attribute_tag, selected, onConfirm }) {
    const { data: condition_applications } = api.submissions.condition_applications
        .useGetSubmissionSampleConditionApplications(
            { tag: submission_tag, attribute_tags: attribute_tag },
            { enabled: _.isString(submission_tag) && _.isString(attribute_tag) }
        )

    if (!_.isArray(condition_applications) || condition_applications.length < 1) return null

    const uniqueCAValuesJoined = _.uniq(
        condition_applications.map(ca => _.join(_.get(ca, [attribute_tag], []).sort()))
    )
    const uniqueCAValues = uniqueCAValuesJoined.map(joined => joined.split(","))

    return <div className="flex center-items" style={{ gap: "0.2rem" }}>
        <CAGroupSelection
            ca_tags={uniqueCAValues}
            selected={selected}
            exclude_tags={[]}
            placeHolder="All (no filter)"
            onConfirm={onConfirm} />
        {selected.length > 0
            ? <span
                style={{ cursor: "pointer", fontSize: "0.7rem" }}
                onClick={() => onConfirm([])}>✕</span>
            : null}
    </div>

}
    
export function ConditionApplicationSelection({ submission_tag, onConfirm, reset_after_confirm = false, isLoadingData = false }) {
    const [attribute, setAttribute] = useState(undefined)
    const [pairwiseComp, setPairwiseComp] = useState({left : [], right : [], impute : false, annotation_tag : undefined})
    const [withinFilters, setWithinFilters] = useState({})
    const [activeWithinAttributes, setActiveWithinAttributes] = useState([])
    const [sampleCounts, setSampleCounts] = useState({})
    const { data: ca_attributes, isLoading, isSuccess } = api.submissions.condition_applications.useGetSubmissionSampleConditionApplicationAttributes({tag : submission_tag}, {enabled : _.isString(submission_tag)})
    
    
    const inputIsSufficient = _.isString(attribute)
    && pairwiseComp.left.length > 0
    && pairwiseComp.right.length > 0
    && (sampleCounts.left ?? 0) >= 2
    && (sampleCounts.right ?? 0) >= 2

    const withinAttributes = _.isArray(ca_attributes) && _.isString(attribute)
        ? ca_attributes.filter(t => t !== attribute)
        : []

    const handleSelection = (value, key) => {
        setPairwiseComp(prevValues => ({ ...prevValues, [key] : value }))
    }

    const handleReset = () => {
        setAttribute(undefined)
        setPairwiseComp({left : [], right : [], impute : false})
        setWithinFilters({})
        setActiveWithinAttributes([])
        setSampleCounts({})
    }
    

    const handleConfirm = () => {
        if (!inputIsSufficient) return null
        
        const activeWithinAttrTags = _.keys(withinFilters).filter(attr => 
            _.isArray(withinFilters[attr]) && withinFilters[attr].length > 0
        )
        
        onConfirm({
            sample_attribute_tag: attribute,
            ca_tag_left: _.join(pairwiseComp.left, ";"),
            ca_tag_right: _.join(pairwiseComp.right, ";"),
            within_attribute_tags: _.join(activeWithinAttrTags, ";"),
            within_ca_tags: _.join(activeWithinAttrTags.map(attr => _.join(withinFilters[attr], ";")), ";"),
            impute: pairwiseComp.impute || false,
            annotation_tag: pairwiseComp.annotation_tag
        })
        if (reset_after_confirm) handleReset()
    }
    return <div>
        <h4>Define pairwise comparison</h4>
        {isLoading ? <Loading /> : null}
        {isSuccess ? <div> 
            <span>Select an attribute to define pairwise comparison groups.</span>
            <AttributeSelection
                attribute_tags={ca_attributes}
                selected={_.isString(attribute) ? [attribute] : []}
                onSelect={(attribute_tag) => { setAttribute(attribute_tag); setWithinFilters({}); setActiveWithinAttributes([]) }} />
        </div> : null}

        
        
        {_.isString(attribute) ?
            
            <div className="margin-top--little"> 
                <span>Select conditions to compare.</span>
                <div className="flex">
                    <GroupCASelection
                        submission_tag={submission_tag}
                        pairwiseComp={pairwiseComp}
                        attribute_tag={attribute}
                        withinFilters={withinFilters}
                        onCountChange={setSampleCounts}
                        onConfirm={handleSelection} />
                </div>
            </div> : null}
            {withinAttributes.length > 0 ?
            <div className="margin-top--little">
                <span>Define the within conditions.</span>
                {withinAttributes.length > 0 ?
                    <Select
                        items={withinAttributes}
                        filterable={false}
                        itemRenderer={(attr_tag, { handleClick }) => (
                            <motion.button
                                key={attr_tag}
                                whileHover={{ backgroundColor: HIGHLIGHT_COLOR, color: "#ffffff" }}
                                className={activeWithinAttributes.includes(attr_tag) ? "basic-button basic-button--highlighted flex" : "basic-button flex"}
                                style={{ width: "100%" }}
                                onClick={handleClick}>
                                {activeWithinAttributes.includes(attr_tag) ? <span style={{ marginRight: "0.2rem" }}>✓</span> : null}
                                <Attribute attribute_tag={attr_tag} />
                            </motion.button>
                        )}
                        onItemSelect={(attr_tag) => setActiveWithinAttributes(prev =>
                            prev.includes(attr_tag) ? prev.filter(t => t !== attr_tag) : [...prev, attr_tag]
                        )}
                        closeOnSelect={false}
                    >
                    <button className="basic-button" style={{ width: "fit-content" }}>
                        Select within attributes
                    </button>
                    </Select>
                    : null}
                    {activeWithinAttributes.map(attr_tag =>
                        <div key={attr_tag} className="margin-top--little flex center-items" style={{ gap: "0.5rem" }}>
                            <Attribute attribute_tag={attr_tag} />
                            <WithinCASelection
                                submission_tag={submission_tag}
                                attribute_tag={attr_tag}
                                selected={withinFilters[attr_tag] ?? []}
                                onConfirm={(ca_tags) => setWithinFilters(prev => ({ ...prev, [attr_tag]: ca_tags }))} />
                        </div>
                    )}
                </div> : null}

        {_.isObject(sampleCounts) && _.keys(sampleCounts).length > 0
            ? <span className="margin-top--little">Number of selected samples of left <strong>{sampleCounts.left || 0}</strong> and right <strong>{sampleCounts.right || 0}</strong> group.</span>
            : null}
        <div className="margin-top--little">
            <h4>Subset data by annotation</h4>
            <AnnotationSelectionMenu selected_tags={[pairwiseComp.annotation_tag].filter(t => _.isString(t))} onSelection={(e, tag) => setPairwiseComp(prevValues => { return { ...prevValues, annotation_tag: tag } })} showTags={false} placeholder="Select annotation" submission_tags={[submission_tag]}/>
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
        <div>
        <button className= {inputIsSufficient ? "basic-button" : "basic-button basic-button--excluded"} disabled={!inputIsSufficient} onClick={handleConfirm}>Confirm</button> 
        <button disabled={isLoadingData} onClick={handleReset} className="basic-button margin-top--little">Reset</button>
        </div>
        {isLoadingData ? <strong><Loading /></strong>: null }
    </div>

}

