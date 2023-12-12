import _ from "lodash"


/**
 * 
 * @param {Object} props
 * @param {import("../types/attributes").Attribute} props.attribute - The attribute this fake attribute value is for
 * @param {string|number} props.numericInput - Numeric input value 
 * @returns 
 */
export function createFakeAttributeValue({ attribute, numericInput }) {
    return {
        id: -1,
        attribute_id: attribute.id,
        tag: `${attribute.tag}:${numericInput}`,
        name: `${numericInput}`
    }
}

/**
 * 
 * @param {Object} props
 * @param {Object[]} props.data
 * @param {import("../types/submissions").Submission} props.metadata
 * @param {string} props.keyName - The keyname of the objects in the data array where to find the sample name. 
 * @param {Boolean} props.includeReplicates - If relicate ids should be added. 
 * @returns {Object[]} 
 */
export function mapSampleAttributesToSampleNamesinArray({ data, metadata, keyName, includeReplicates = true }) {
    
    const sampleNames = metadata.sample_names 
    const sampleAttributes = metadata.samples_attributes
    const replicates = metadata.replicates 

    return data.map(d => {
        const sampleIdx = sampleNames.indexOf(d[keyName])
        const sampleReplicate = replicates.at(sampleIdx)
        return {...d, "Replicate" : sampleReplicate}
    })
}


function inverseSamplesAttributes(sampleAttributes) {
    
}

function mapSampleNamesToSamplesAttributes({ sampleNames, samplesAttributes }) {
    const attributeNames = _.values()
    return sampleNames.map(sampleName => {

    })
}





export function mapAttributeTagsToAttributes({tagAttributes, attributesByTag}) {
    return Object.fromEntries(Object.keys(tagAttributes)
        .filter(attributeTag => _.has(attributesByTag.attributes, attributeTag) && _.isArray(tagAttributes[attributeTag])).map(attributeTag => {
        return [attributeTag, _.map(tagAttributes[attributeTag], (attributeValueTag) =>
            _.isObject(attributeValueTag) ? attributeValueTag : _.has(attributesByTag.attribute_values, attributeValueTag) ?
                attributesByTag.attribute_values[attributeValueTag] :
                createFakeAttributeValue({ attribute: attributesByTag.attributes[attributeTag], numericInput: attributeValueTag.split(":").at(-1) }))]
    }))
}

export function getAttributeForUserNumericInput({ attributeTag, attributeValueTag, attributesByTag }) {
    return createFakeAttributeValue({ attribute: attributesByTag.attributes[attributeTag], numericInput: attributeValueTag.split(":").at(-1) })
}

export function mapAttributeValueTagsToAttributeValues({ attributeTags = [], attributesByTag = {} }) {
    return attributeTags.map(attrValueTag => {
        if (_.has(attributesByTag.attribute_values, attrValueTag)) return attributesByTag.attribute_values[attrValueTag]
        else {
            let attributeTagSplit = attrValueTag.split(":")
            let attribute = attributesByTag.attributes[attributeTagSplit[0]]
            if (!_.isObject(attribute)) return 
            return createFakeAttributeValue({attribute, numericInput: attributeTagSplit[1]})
        }
    }).filter(v => _.isObject(v))
}


/**
 * 
 * @param {Object} props
 * @param {String} props.attrValueTag - The attribute value tag. If multiple tags are present, they are expected to be devided by a space. (' ')
 * @param {Object.<string, import("../types/attributes").Attribute | import("../types/attributes").AttributeValue>} props.attrValuesByTag - The attribute value tag. If multiple tags are present, they are expected to be devided by a space. (' ')
 * @returns {import("../types/attributes").MappedAttributeValueTag} - Mapped attribute value.
 */
export function mapAttributeValueTagsToAttributes({ attrValueTag, attrValuesByTag, joinString = " + " }) {
    let attrValues = undefined
    if (_.isString(attrValueTag) && attrValueTag.startsWith("att_")) {
        if (attrValueTag.includes(" ")) {
            attrValues = attrValueTag.split(" ").map(splitAttrValueTag => _.has(attrValuesByTag,splitAttrValueTag)?attrValuesByTag[splitAttrValueTag]:attrValueTag)
        }
        else if (_.has(attrValuesByTag,attrValueTag)){
            attrValues = [attrValuesByTag[attrValueTag]]
        }

        else {
            attrValues = [{tag : attrValueTag, name : attrValueTag.split(":").at(-1)}]
        }
        return {attrValues, asString : _.join(attrValues.map(attr => attr.name),joinString), isAttrValue : true}
    }
    else {
        return {attrValues, asString : attrValueTag, isAttrValue : false}
    }
    
}


