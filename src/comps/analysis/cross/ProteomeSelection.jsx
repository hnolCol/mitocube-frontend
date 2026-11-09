import { HTMLSelect } from "@blueprintjs/core";
import _ from "lodash";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";

function ProteomeOption({ tag }) {
    const { data: proteome_text } = api.proteomes.queryProteomes.useGetProteomeText(
        { tag }, { enabled: _.isString(tag), staleTime: Infinity })
    return <option key={tag} value={tag}>{_.isString(proteome_text) ? proteome_text : tag}</option>
}

/**
 * @description Select a proteome from the proteomes known to the backend.
 * The options display the proteome text.
 */
export function ProteomeSelection({ proteome_tag, setProteomeTag }) {
    const { data: proteomes, isLoading } = api.proteomes.queryProteomes.useGetProteomeBySearchString({ search_string: "", limit: 100 })
    const { data: proteome_text } = api.proteomes.queryProteomes.useGetProteomeText(
        { tag: proteome_tag }, { enabled: _.isString(proteome_tag) && proteome_tag.length > 0, staleTime: Infinity })

    if (isLoading) return <Loading />
    if (!_.isArray(proteomes) || proteomes.length === 0) {
        return <div>No proteomes found.</div>
    }

    return (
        <div className="flex align-center" style={{ gap: "0.5rem" }}>
            <span>Proteome</span>
            <HTMLSelect
                value={proteome_tag ?? ""}
                onChange={e => setProteomeTag(e.target.value)}
            >
                <option key="empty" value="">{_.isString(proteome_text) ? proteome_text : "Select a proteome..."}</option>
                {proteomes.map(tag => <ProteomeOption key={tag} tag={tag} />)}
            </HTMLSelect>
        </div>
    )
}
