import _ from "lodash"


/**
 * @description The samples attributes as a list of samples and their attributes. 
 * @param {Object} props
 * @param {import("../types/attributes").SampleAttributes} props.sampleAttributes - The samples attributes 
 * @param {String[]} props.sampleNames - The samples names. 
 * @returns {Object[]} Samples attribute in an array of length samplesNames.length. Each item is an object with keys of attributeTags and values as a list
 * of AttributeValueTags. If a sample is annotated with multiple attribute values of the same attribute. 
 */
export function inverseSamplesAttributes({ sampleAttributes, sampleNames }) {
    const result = _.range(sampleNames.length).map(idx => _.fromPairs(_.keys(sampleAttributes).map(attributeTag => [attributeTag, []])))
    return _.reduce(_.keys(sampleAttributes), (p, attributeTag, idx) => {
        const { values } = sampleAttributes[attributeTag]
        _.keys(values).map(attributeValueTag => _.forEach(values[attributeValueTag], sampleIdx => p[sampleIdx][attributeTag].push(attributeValueTag)))
        return p 
    }, result)   
}




export function mapAttributeTagsToAttributes({tagAttributes, attributesByTag}) {
    return Object.fromEntries(_.keys(tagAttributes)
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
            attrValues = [{tag : attrValueTag, text : attrValueTag.split(":").at(-1)}]
        }
        return {attrValues, asString : _.join(attrValues.map(attr => attr.text),joinString), isAttrValue : true}
    }
    else {
        return {attrValues, asString : attrValueTag, isAttrValue : false}
    }
    
}



/**
 * @description Maximum number of unique condition applications an attribute may have to be selected by default for representation (e.g. as color, split or subplot in a categorical chart). Attributes with more unique condition applications (e.g. a MOUSE ID attribute with one value per sample) are not selected by default.
 */
export const MAX_DEFAULT_CONDITION_APPLICATIONS = 8

/**
 *
 * @param {Object} props
 * @param {Object[]} props.data - List of data rows. Each row may contain condition application tags per attribute, multiple tags separated by ";".
 * @param {String[]} props.attribute_tags - The attribute tags to count the unique condition applications for.
 * @returns {Object.<string, number>} Map of attribute tag to the number of unique condition applications in the data.
 */
export function getConditionApplicationCounts({ data = [], attribute_tags = [] }) {
    return _.fromPairs(attribute_tags.map(attribute_tag => [attribute_tag,
        _.uniq(_.flatMap(data, d => {
            const value = _.isObject(d) ? d[attribute_tag] : undefined
            return _.isString(value) && value.length > 0 ? value.split(";") : []
        })).length
    ]))
}

/**
 *
 * @param {Object} props
 * @param {String[]} props.attribute_tags - The attribute tags to filter.
 * @param {Object.<string, number>} props.counts - Map of attribute tag to the number of unique condition applications. Attributes without a known count are kept.
 * @param {number} props.max - The maximum number of unique condition applications for an attribute to be kept.
 * @returns {String[]} The attribute tags with at most `max` unique condition applications.
 */
export function filterAttributeTagsByConditionApplicationCount({ attribute_tags = [], counts = {}, max = MAX_DEFAULT_CONDITION_APPLICATIONS }) {
    return attribute_tags.filter(attribute_tag => !_.has(counts, attribute_tag) || counts[attribute_tag] <= max)
}
