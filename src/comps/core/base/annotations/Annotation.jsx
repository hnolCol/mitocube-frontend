
import hooks from "@mitocube/api-hooks"
import _ from "lodash"

export function Annotation({ tag }) {

    const { data : annotation, isSuccess } = hooks.annotations.useGetAnnotationsByTag({tag}, { enabled: _.isString(tag) && tag.length > 0 })

    return <div>
        {isSuccess && _.has(annotation, "text") ? annotation.text : null}
    </div>
}