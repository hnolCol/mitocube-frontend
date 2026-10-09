import PropTypes from "prop-types"
import _ from "lodash"
import { api } from "@/api"

ConsortiumText.propTypes = {
    tag: PropTypes.string.isRequired
}

export function ConsortiumText({ tag }) {
    const { data: consortium, isSuccess } = api.consortiums.useGetConsortiumByTag(
        { tag }, { enabled: _.isString(tag) && tag.length > 0, staleTime: 300000 }
    )
    return <span>{isSuccess && _.isObject(consortium) ? `${consortium.text} (${consortium.abbreviation})` : tag}</span>
}

ConsortiumTagWithText.propTypes = {
    tag: PropTypes.string.isRequired
}

export function ConsortiumTagWithText({ tag }) {
    return <div className="flex align-center">
        <span className="font-size--smallest margin-right--little">{tag}</span>
        <ConsortiumText tag={tag} />
    </div>
}
