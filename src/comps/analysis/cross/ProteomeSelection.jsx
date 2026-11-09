import { HTMLSelect } from "@blueprintjs/core";
import _ from "lodash";
import { api } from "@/api";
import { Loading } from "@/comps/core/base/states/Loading";

/**
 * @description Select a proteome from the proteomes known to the backend.
 */
export function ProteomeSelection({ proteome_tag, setProteomeTag }) {
    const { data: proteomes, isLoading } = api.proteomes.queryProteomes.useGetProteomeBySearchString({ search_string: "", limit: 100 })

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
                <option key="empty" value="">Select a proteome...</option>
                {proteomes.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </HTMLSelect>
        </div>
    )
}
