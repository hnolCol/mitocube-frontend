// import ResearchGroupIcon from "../../svg/icons/chartSelection/ResearchGroup";

// import {api} from "@/api"

// export function ResearchGroupInput({selectedItems, onItemSelect, minimal = true }) {

//     // const { data : researchgroups, isSuccess } = api.research_groups.useGetResearchGroups()

//     return (
//         <ResearchGroupIcon 
//             placeholder="Research Group.."
//             items={[]} //research groups
//             textKey="name"
//             labelKey=""
//             minimal={minimal}
//             callbackKey={"research_group"}
//             selectedItems={selectedItems}
//             callback={onItemSelect}
//             />
//     )
// }

import { api } from "@/api"
import PropTypes from "prop-types"
import { BaseInput } from "./BaseInput"

function ResearchGroupTitle({ tag }) {
    const { data: rg } = api.researchgroups.useGetResearchGroupByTag(
        { tag },
        { enabled: tag && tag.length > 0 }
    )
    return <span>{rg?.text || tag}</span>
}

ResearchGroupInput.propTypes = {
    selected_rg_tags: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func.isRequired
}

export function ResearchGroupInput({ selected_rg_tags = [], onSelect }) {
    return <BaseInput
        selected_tags={selected_rg_tags}
        render_children={(rg_tag) => <ResearchGroupTitle tag={rg_tag} />}
        api_hook={api.researchgroups.useGetResearchGroupsByQuery}
        onSelect={onSelect}
        placeholder="Select Research Group" />
}