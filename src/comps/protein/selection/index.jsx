import { useState } from "react"
import { OmnibarSearch } from "./Omnibar"
import { useNavigate, useOutletContext } from "react-router"
import { getItemFromLocalStorage, saveInLocalStorage } from "@/services/localstorage"
import _ from "lodash"
function ProteinSelection(props) {
    const { handleFeatureList } = useOutletContext()
    const [omnibarIsOpen, setOmnibarIsOpen] = useState(true)
    const redirect = useNavigate()
    
    const [proteomeTags, setProteomeTags] = useState(() => {
        const {itemFound, itemValue} = getItemFromLocalStorage({ itemName: "proteomeTags", parseJson: true })
        console.log("Loaded proteome tags from local storage:", itemValue)
        return itemFound && _.isArray(itemValue) ? itemValue : []
    })
    const handleClose = (e, featureURL) => {
        //dont actually close it just redirect
        if (featureURL !== undefined) redirect(featureURL)
        else redirect('/protein')
    }

    // Wrap setProteomeTags to also persist
    const updateProteomeTags = (tags) => {
        saveInLocalStorage({itemName : "proteomeTags", itemValue : JSON.stringify(tags)})
        setProteomeTags(tags)
    }

    return (<OmnibarSearch
        isOpen={omnibarIsOpen}
        onSelect={handleFeatureList}
        onClose={handleClose}
        proteomeTags={proteomeTags}
        setProteomeTags={updateProteomeTags}
    />
   )
}


export default ProteinSelection

