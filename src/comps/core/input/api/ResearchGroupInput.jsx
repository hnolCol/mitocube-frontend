import ResearchGroupIcon from "../../svg/icons/chartSelection/ResearchGroup";

import {api} from "@/api"

export function ResearchGroupInput({selectedItems, onItemSelect, minimal = true }) {

    // const { data : researchgroups, isSuccess } = api.research_groups.useGetResearchGroups()

    return (
        <ResearchGroupIcon 
            placeholder="Research Group.."
            items={[]} //research groups
            textKey="name"
            labelKey=""
            minimal={minimal}
            callbackKey={"research_group"}
            selectedItems={selectedItems}
            callback={onItemSelect}
            />
    )
}