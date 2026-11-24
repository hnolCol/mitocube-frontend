import PropTypes from "prop-types"
import _ from "lodash"
import { HTMLSelect } from "@blueprintjs/core"
import { api } from "@/api"
import { ConsortiumText } from "@/comps/submission/view/ConsortiumText"

ConsortiumOptionText.propTypes = {
    tag: PropTypes.string.isRequired
}

function ConsortiumOptionText({ tag }) {
    const { data: consortium, isSuccess } = api.consortiums.useGetConsortiumByTag(
        { tag }, { enabled: _.isString(tag) && tag.length > 0, staleTime: 300000 }
    )
    return isSuccess && _.isObject(consortium) ? `${consortium.text} (${consortium.abbreviation})` : tag
}

ConsortiumInput.propTypes = {
    selected_consortium_tags: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func.isRequired,
    helperText: PropTypes.string
}

export function ConsortiumInput({ selected_consortium_tags = [], onSelect, helperText }) {
    const { data: userConsortiums } = api.consortiums.useGetUserConsortiums({}, { staleTime: 300000 })
    const { data: pendingTermsConsortiums } = api.consortiumTerms.useGetUserConsortiumsWithPendingTerms(
        {}, { staleTime: 300000 }
    )
    const { data: isHead } = api.researchgroups.useGetMyIsHead({}, { staleTime: 300000 })

    const consortiumTags = _.isArray(userConsortiums) ? userConsortiums : []
    if (consortiumTags.length === 0) return null

    const pendingTermsTags = _.isArray(pendingTermsConsortiums) ? pendingTermsConsortiums : []
    const shareableTags = _.difference(consortiumTags, pendingTermsTags)
    const blockedTags = _.difference(consortiumTags, shareableTags)
    const selected = _.intersection(selected_consortium_tags, shareableTags)

    const handleSelect = (event) => {
        const consortium_tag = event.currentTarget.value
        onSelect(consortium_tag === "" ? null : consortium_tag)
    }

    return <div className="margin-top--medium">
        <h3>Consortium</h3>
        {shareableTags.length > 0
            ? <HTMLSelect
                value={_.isEmpty(selected) ? "" : selected[0]}
                onChange={handleSelect}
                fill={true}>
                <option value="">No consortium sharing</option>
                {shareableTags.map(consortium_tag => <option key={consortium_tag} value={consortium_tag}><ConsortiumOptionText tag={consortium_tag} /></option>)}
            </HTMLSelect>
            : <p className="font-size--small">Consortium sharing is not available yet: the head (PI) of your research group has to agree to the consortium terms first.</p>}
        {_.isString(helperText) ? <p className="font-size--small">{helperText}</p> : null}
        {blockedTags.length > 0
            ? <p className="font-size--small">
                The following consortiums are not shareable yet because your PI has not agreed to their share terms: {blockedTags.map((tag, idx) => <span key={tag}>{idx > 0 ? ", " : ""}<ConsortiumText tag={tag} /></span>)}. As soon as your PI agrees, they can be selected here.
            </p>
            : null}
        {isHead !== true && shareableTags.length > 0
            ? <p className="font-size--small">
                Note: the sharing only becomes active after the head (PI) of your research group has agreed first. Until then the share stays pending.
            </p>
            : null}
    </div>
}
