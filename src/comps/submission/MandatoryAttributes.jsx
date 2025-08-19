import _, { find } from "lodash"
import { TraitsInput } from "../core/input/api/TraitsInput"
import Loading from "../core/base/loading"
import hooks from "@mitocube/api-hooks"

export function MandatoryAttributes({ onAttributeValueSelect, submission_state = 0, getSelectionByPath, findPath}) {
    
    const {
        data: attribute_tags,
        isLoading,
        isFetching } = hooks.attributes.groups.useGetAttributeByGroup({ tag: "mandatory", min_state: submission_state })
    return (
        <div>
            {isLoading || isFetching ? <Loading /> :
                _.isArray(attribute_tags) ?
                    attribute_tags.map(attribute_tag => {
                        let p = [{ type: "attribute", tag: attribute_tag }]
                        let selection = findPath(p) 
                        return <TraitsInput
                            key={attribute_tag}
                            attribute_tag={attribute_tag}
                            onItemSelect={onAttributeValueSelect} 
                            path={p}
                            {...{
                                selected_traits: _.isObject(selection) && _.isArray(selection.children) && selection.children.length > 0 ? selection.children.map(c => c.tag) : [] // find the path first, then extract the children tags
                            }} //show here only the first level traits, not if there children.
                            />
                    }) : null}
                
            </div> 
        )
    }