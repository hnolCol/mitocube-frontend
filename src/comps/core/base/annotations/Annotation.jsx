
import { api } from "@/api"
import _ from "lodash"

export function Annotation({ tag, indicateNumberProteins = true }) {

    const { data : annotation, isSuccess } = api.annotations.queryAnnotations.useGetAnnotationsByTag({tag}, { enabled: _.isString(tag) && tag.length > 0 })
    const { data: proteinCount, isSuccess: isProteinCountSuccess } = api.annotations.queryAnnotations.useGetAnnotationProteinCount({ tag }, { enabled: indicateNumberProteins && _.isString(tag) && tag.length > 0 })
    return <div className="flex center-items">
        {isSuccess && _.has(annotation, "text") ? annotation.text : null}
        {indicateNumberProteins && isProteinCountSuccess ? <span style={{ fontSize: "0.7rem", color: "grey", marginLeft : "0.45rem" }}> ({proteinCount})</span> : null}
    </div>
}