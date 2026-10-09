import PropTypes from "prop-types"
import _ from "lodash"
import { HTMLSelect } from "@blueprintjs/core"
import { api } from "@/api"

ConsortiumInput.propTypes = {
    selected_consortium_tags: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func.isRequired,
    helperText: PropTypes.string
}

export function ConsortiumInput({ selected_consortium_tags = [], onSelect, helperText }) {
    const { data: userConsortiums } = api.consortiums.useGetUserConsortiums({}, { staleTime: 300000 })

    if (!_.isArray(userConsortiums) || userConsortiums.length === 0) return null

    const handleSelect = (event) => {
        const consortium_tag = event.currentTarget.value
        onSelect(consortium_tag === "" ? null : consortium_tag)
    }

    const selected = _.intersection(selected_consortium_tags, userConsortiums)

    return <div style={{ marginTop: "1rem" }}>
        <h3>Consortium</h3>
        <HTMLSelect
            value={_.isEmpty(selected) ? "" : selected[0]}
            onChange={handleSelect}
            fill={true}>
            <option value="">No consortium sharing</option>
            {userConsortiums.map(consortium_tag => <option key={consortium_tag} value={consortium_tag}>{consortium_tag}</option>)}
        </HTMLSelect>
        {_.isString(helperText) ? <p className="font-size--small">{helperText}</p> : null}
    </div>
}
