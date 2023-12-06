import _ from "lodash"

export function createFakeAttributeValue({ attribute, numericInput }) {
    return {
        id: -1,
        attribute_id: attribute.id,
        tag: `${attribute.tag}:${numericInput}`,
        name: `${numericInput}`
    }
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


