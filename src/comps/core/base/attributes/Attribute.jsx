import PropTypes from 'prop-types'
import hooks from "@mitocube/api-hooks"



Attribute.propTypes = {
    attribute_tag: PropTypes.string.isRequired
}

/**
 * 
 * @param {Object} props 
 * @param {String} props.attribute_tag The tag associated with the attribute that should be displayed. 
 * @returns 
 */
export function Attribute({ attribute_tag }) {
    const {data : attribute, isSuccess } = hooks.attributes.useGetAttribute({tag : attribute_tag})
    return (<div
        style={{ fontSize: "0.75rem" }} 
        className="flex center-items padding--tiny cursor--default div--round margin-right--tiny">
        {isSuccess ? attribute.text : null}
    </div>)
}