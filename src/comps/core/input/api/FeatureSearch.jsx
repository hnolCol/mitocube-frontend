



import { useEffect, useState } from "react"
import useDebounce from "../../../../hooks/useDebounce"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"


export function FeatureSearch({ compare_to_list = [], onIndexFind, searchIndices = new Set() }) {
    const [searchString,setSearchString] = useState("")
    const debouncedString = useDebounce(searchString,100)
    const { data : feature_tags, isLoading, isFetching, } =  hooks.features.useGetFeaturesByQuery({search_string : debouncedString, limit : 200}, {enabled : debouncedString.length > 0, onSuccess : (data) => handleSuccess(data), staleTime : 5 * 60 * 1000})

    useEffect(() => {
        if (debouncedString.length === 0) {
            searchIndices.clear()
            onIndexFind(searchIndices)
        }
     }, [debouncedString])

    const handleSuccess = (data) => {
        const foundIndices = data.map((item) => {
            const foundIndex = compare_to_list.findIndex(tag => tag === item.tag);
            return foundIndex;
        });
        // rather use the AND? 
        foundIndices.filter(i => i !== -1).forEach(index => searchIndices.add(index));
        onIndexFind(searchIndices)
    }



    return <div><input className="search-input" type="text"
                    placeholder="Search for features..."
                    value={searchString}
        onChange={(e) => setSearchString(e.target.value)} />
    </div> 
}