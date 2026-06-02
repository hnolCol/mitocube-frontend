import { api } from "@/api"
import { StarIcon } from "@/comps/core/svg/icons/StarIcon";
import _ from "lodash"; 
import { useEffect } from "react";


export function ProteinFavorite({ tag, justIcon = false, size = 24 }) {


    const { data: isFavorite, refetch } = api.features.proteinsFavorite.useGetProteinIsFavorite({ tag }, { enabled: _.isString(tag), staleTime : 60000 })
    const { mutate: toggleFavorite, isSuccess } = api.features.proteinsFavorite.usePostFavoriteProtein({ onSuccess : () => refetch()})
    
    return <div><StarIcon filled={isFavorite} color={isFavorite ? "#f5b301" : "#ccc"} size={size}
        onClick={justIcon ? undefined : (e) => { e.stopPropagation(); toggleFavorite({ tag, remove_if_exists: isFavorite }) }} /></div>
}