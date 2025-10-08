import { AdminAttributeItem } from "./AttributeItem";
import _ from "lodash";
import PropTypes from "prop-types";

AttributeContainer.propTypes = {
    attribute_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    isOpen: PropTypes.bool
};

AttributeContainer.defaultProps = {
    isOpen: true
};

/**
 * 
 * @param {Object} props 
 * @param {String[]} props.attribute_tags - The list of attribute tags to display
 * @param {Boolean} props.isOpen - Whether the container is open or not (e.g. shown or not)
 * @returns 
 */
export function AttributeContainer({ attribute_tags, isOpen }) {
    return (<div className="flex flex-column flex-start margin-left--medium">
        {_.isArray(attribute_tags) && isOpen  && attribute_tags.map((tag, idx) => (
            <AdminAttributeItem key={`${tag}-${idx}`} tag={tag}/>
        ))}
    </div>)
}