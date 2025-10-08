
import _ from "lodash" 
import hooks from "@mitocube/api-hooks"
import PropTypes from "prop-types";


TraitCount.propTypes = {
    tag: PropTypes.string.isRequired,
    text: PropTypes.string
}
TraitCount.defaultProps = {
    text : "Trait"
}


/**
 * 
 * @param {Object} props 
 * @param {String} props.tag - The attribute tag for which the trait count should be displayed 
 * @param {String} props.text - The text to display before the count     
 * @returns {JSX.Element} The trait count component
 */
export function TraitCount({tag , text }) {
    const { data: count, isError, isFetching } = hooks.traits.useGetTraitCount({tag}, {
        staleTime: 60000, placeholderData: (prev) => prev || 0, enabled : tag && tag.length > 0
    })
    return <div>{text}: <strong>{count}</strong></div>
}
