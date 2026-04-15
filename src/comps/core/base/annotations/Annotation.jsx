
import { api } from "@/api"
import _ from "lodash"

export function Annotation({ tag }) {

    const { data : annotation, isSuccess } = api.annotations.queryAnnotations.useGetAnnotationsByTag({tag}, { enabled: _.isString(tag) && tag.length > 0 })

    return <div>
        {isSuccess && _.has(annotation, "text") ? annotation.text : null}
    </div>
}