import _, { find } from "lodash"
import { TraitsInput } from "../core/input/api/TraitsInput"
import Loading from "../core/base/loading"
import { api } from "@/api"
import { Tag } from "@blueprintjs/core"

export function MandatoryAttributes({onTraitSelect, submission_state = 0, getSelectionByPath, findPath, referenceID}) {
    
    const {
        data: attribute_tags,
        isLoading,
        isFetching } = api.attributes.queryAttributes.useGetAttributeByGroup({ tag: "mandatory", min_state: submission_state })
    return (
        <div>
            {isLoading || isFetching ? <Loading /> :
                _.isArray(attribute_tags) ?
                    attribute_tags.map(attribute_tag => {
                        let p = [{ type: "attribute", tag: attribute_tag, "id" : attribute_tag }]
                        let selection = findPath(p) 
                        return <TraitsInput
                            key={attribute_tag}
                            attribute_tag={attribute_tag}
                            onItemSelect={onTraitSelect} 
                            path={p}
                            isMandatory={true}
                            referenceID={referenceID}
                            {...{
                                selected_traits: _.isObject(selection) && _.isArray(selection.children) && selection.children.length > 0 ? selection.children.map(c => c.tag) : [] // find the path first, then extract the children tags
                            }} //show here only the first level traits, not if there children.
                            />
                    }) : null}
                
            </div> 
        )
    }


    export function MandatoryCheckDetail({ submission_tag }) {
        const { data, isLoading } = api.submissions.core.useCheckSubmission(
            { tag: submission_tag },
            { enabled: _.isString(submission_tag) }
        )
        if (isLoading || !data) return null
        if (data.complete) return <Tag intent="success" minimal>Mandatory complete</Tag>
    
        return (
            <div style={{ padding: "10px 12px", backgroundColor: "#fff3e0", borderRadius: "4px" }}>
                <strong style={{ color: "#bf7326" }}>Missing Attributes</strong>
                <p style={{ color: "#bf7326", fontSize: "0.8rem", margin: "4px 0 8px 0" }}>
                    Based on the current submission state, the following {data.missing.length} attributes are required:
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#bf7326", fontSize: "0.85rem" }}>
                    {data.missing.map(m => (
                        <li key={m.tag}>{m.text}</li>
                    ))}
                </ul>
            </div>
        )
    }
    export function MandatoryCheckBadge({ submission_tag }) {
        const { data, isLoading } = api.submissions.core.useCheckSubmission(
            { tag: submission_tag },
            { enabled: _.isString(submission_tag) }
        )

        if (isLoading || !data) return null
        if (data.complete) return <Tag intent="success" minimal>Mandatory complete</Tag>
        return (
            <Tag intent="warning" minimal>
                {data.filled}/{data.total} mandatory attributes
            </Tag>
        )
    }