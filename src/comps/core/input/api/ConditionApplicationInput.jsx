import _ from "lodash"
import hooks from "@mitocube/api-hooks"



export function ConditionApplicationInput({ }) {

    hooks.condition_applications.useGetConditionApplicationByQuery({search_string: ""}, { enabled: false })

    return <div></div>
}