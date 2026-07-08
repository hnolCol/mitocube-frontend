

import PropTypes from 'prop-types'
import {api} from "@/api"
import _ from "lodash"

AttributeAbbreviation.propTypes = {
    attribute_tag: PropTypes.string.isRequired
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.attribute_tag The tag associated with the attribute that should be displayed. 
 * @returns 
 */
export function AttributeAbbreviation({ attribute_tag, suffix ="=" }) {
    const {data : abbr, isSuccess } = api.attributes.queryAttributes.useGetAttributeAbbreviation({tag : attribute_tag})
    return (<span> {isSuccess && _.isString(abbr) && abbr.length > 0 ? abbr + suffix : null}</span>)
}