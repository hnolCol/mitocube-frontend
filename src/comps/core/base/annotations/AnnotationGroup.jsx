
import hooks from "@mitocube/api-hooks"
import _ from "lodash"

export function AnnotationGroup({ tag }) {

    const { data : annotation_group, isSuccess } = hooks.annotations.useGetAnnotationGroupByTag({tag}, { enabled: _.isString(tag) && tag.length > 0 })

    return <div>
        {isSuccess && _.has(annotation_group, "text") ? annotation_group.text : null}
    </div>
}