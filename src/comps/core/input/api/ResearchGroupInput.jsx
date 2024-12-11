import { useGetResearchGroups } from "../../../../hooks/queries/researchgroup.hooks";
import ResearchGroupIcon from "../../svg/icons/chartSelection/ResearchGroup";



export function ResearchGroupInput({selectedItems, onItemSelect, minimal = true }) {

    const { data : researchgroups, isSuccess } = useGetResearchGroups()

    return (
        <ResearchGroupIcon 
            placeholder="Research Group.."
            items={isSuccess && _.isArray(researchgroups) ? researchgroups : []}
            textKey="name"
            labelKey=""
            minimal={minimal}
            callbackKey={"research_group"}
            selectedItems={selectedItems}
            callback={onItemSelect}
            />
    )
}