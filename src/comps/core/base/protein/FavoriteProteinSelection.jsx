
import { api } from "@/api"
import { Protein } from "./Protein"
import _ from "lodash";
export function FavoriteProteinSelection({ submission_tags, proteome_tags, annotation_tags, selected, onSelect, onHover, maxHeight = "300px" }) {


    const { data: favorites } = api.features.proteinsFavorite.useGetFavoriteProteins({ submission_tags, annotation_tags, proteome_tags, limit : 20 }, { staleTime : 6000})
    

    return (
        <div className="flex flex-column" style={{maxHeight, overflowY : "scroll", gap: "0.2rem"}}>
            {_.isArray(favorites) && favorites.map(protein_tag => <Protein redirect_to_protein_site={false} key={protein_tag} disableTooltip tag={protein_tag} onClick={onSelect} highlight={selected.includes(protein_tag)} disableHover={!_.isFunction(onHover)} onHover={onHover} fill/>)}
        </div>
    )
}

