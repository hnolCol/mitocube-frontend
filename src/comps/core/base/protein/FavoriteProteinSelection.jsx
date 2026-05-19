
import { api } from "@/api"
import { Protein } from "./Protein"
import _ from "lodash";
export function FavoriteProteinSelection({ submission_tags, proteome_tags, annotation_tags, onSelect }) {


    const { data: favorites } = api.features.proteinsQuery.useGetFavoriteProteins({ submission_tags, annotation_tags, proteome_tags, limit : 20 })
    
    console.log(favorites)

    return (
        <div>
            {_.isArray(favorites) && favorites.map(protein_tag => <Protein key={protein_tag} tag={protein_tag} />)}
        </div>
    )
}