
import PropTypes from "prop-types"
import hooks from "@mitocube/api-hooks"
import APIError from "../../core/error/APIerror"
import { Loading } from "../../core/base/states/Loading"

import { OptionButton } from "../../core/base/buttons/OptionButton"


AttributeGroupSelection.propTypes = {
    onSelection: PropTypes.func.isRequired,
    selected_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
}

AttributeGroupSelection.defaultProps = {
    selected_tags: [],
}

export function AttributeGroupSelection({ onSelection, selected_tags}) { 

    const {data : attribute_group_tags, isLoading, isError, error} = hooks.attributes.groups.useGetAttributeGroups({limit: 50},{ staleTime : 1000 * 60 * 5, placeholderData: prev => prev || []})
    return (
        <div>
            {isLoading && <Loading />}
            {isError && <APIError error={error} />}
            {attribute_group_tags && (
                <div className="flex flex-wrap gap-2">
                    {attribute_group_tags.map((tag) => (
                        <OptionButton onClick={() => onSelection(tag)} key={tag} isSelected={selected_tags.includes(tag)}  children={<span>{tag}</span>}/>
                    ))}
                </div>
            )}
        </div>
    )
}

        