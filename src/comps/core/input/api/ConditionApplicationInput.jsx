import _ from "lodash"
import { api } from "@/api"

export function ConditionApplicationInput({ }) {

    api.condition_applications.useGetConditionApplicationByQuery({search_string: ""}, { enabled: false })

    return <div></div>
}