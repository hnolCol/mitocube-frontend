
import { api } from "@/api"
import _ from "lodash"

export function AnnotationGroup({ tag }) {

    const { data : annotation_group, isSuccess } = api.annotations.queryAnnotations.useGetAnnotationGroupByTag({tag}, { enabled: _.isString(tag) && tag.length > 0 })

    return <div>
        {isSuccess && _.has(annotation_group, "text") ? annotation_group.text : null}
    </div>
}