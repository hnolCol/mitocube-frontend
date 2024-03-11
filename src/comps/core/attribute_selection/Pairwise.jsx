
import _ from "lodash"
import { useState } from "react"
import { Button, Checkbox, Divider, Tooltip } from "@blueprintjs/core"
import GroupIconWithName from "../svg/icons/chartSelection/Group"
import { TextIconWithName } from "../svg/icons/chartSelection/Text"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"



const initState = {
    sample_attribute_tag: undefined,
    attribute_value_tag_left: undefined,
    attribute_value_tag_right: undefined,
    within_attribute_tag: [],
    within_attribute_value_tag: {},
    impute : false
}
/**
 * 
 * @param {object} props 
 * @param {import("../../types/submissions").Submission} props.metadata
 * @param {Fucntion} props.callback - The function to be called after selection. 
 * @param {String} props.callbackText - The text shown on the callback button 
 * @param {Boolean} props.isLoading - If the component should be display in loading state.
 * @returns 
 */
export function AttributePairwiseSelection({ metadata, callback, callbackText = "Save", isLoading = false }) {

    const [selection, setSelection] = useState(initState)
    const hasSamplesGenotypes = !_.isEmpty(metadata.samples_genotypes)
    const hasSamplesAttributes = !_.isEmpty(metadata.samples_attributes)
    
    const attributesTags = hasSamplesGenotypes ? _.concat(["att_genotype"], _.keys(metadata.samples_attributes)) : _.keys(metadata.samples_attributes)
    const attributes = attributesTags.map(attributeTag => metadata.attributes[attributeTag])
    const attributeValuesByAttributeTag = _.fromPairs(_.map(attributesTags, attributeTag => attributeTag === "att_genotype" ? 
        [attributeTag,_.keys(metadata.samples_genotypes).map(genotypeLabel => metadata.genotypes[genotypeLabel])]
        : [attributeTag, _.keys(metadata.samples_attributes[attributeTag]).map(attributeValueTag => metadata.attribute_values_by_tag[attributeValueTag])]))
    const numberSelection = attributes.length


    const addWithinAttributeToSelection = (key, attribute) => {
        setSelection(prevValues => {
            return {
                ...prevValues,
                [key] : addItemToArrayOrRemoveItIfPresent({array : prevValues.within_attribute_tag,item : attribute})
            }
        })
    }

    const addAttributeToSelection = (key, attribute) => {
        const wasSelected = selection[key] === attribute
        if (wasSelected) {
            setSelection(prevValues => {
                return {
                    ...prevValues,
                    [key]: prevValues[key] === undefined,
                    within_attribute_tag : attributes
                }
            })
        }
        else {
            const nonMatchingAttributes = selection.within_attribute_tag.filter(attr => attr.tag !== attribute.tag)
            setSelection(prevValues => {
                return {
                    ...prevValues,
                    [key]: attribute,
                    within_attribute_tag : nonMatchingAttributes
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
        return attribute.has_features_value?"genes":"text"
    }

    const getPlaceHolderAttribute = (attribute) => {
        return _.isObject(attribute)?attribute.text:""
    }

    const getPlaceHolderAttributeValue = (attribute, attributeValue) => {
        if (!_.isObject(attribute) || !_.isObject(attributeValue)) return ""
        return attribute.has_features_value ? attributeValue.genes : attributeValue.text
    }

    const getTagKeyLabel = (attribute, attributeValue) => {
        if (attribute.tag === "att_genotype") return attributeValue.label
        //even though attribute values wit
        return attributeValue.tag
    }

    const onSave = () => {
        if (!_.isFunction(callback)) return null 
        const props = {
            impute : false,
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
        <div style={{ width: "20rem", backgroundColor: "#efefef" }}>
            <Divider />
            <h4>Comparison Selection</h4>
            
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
            {numberSelection > 1 ? <div className="intent-margin-top--little">
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
