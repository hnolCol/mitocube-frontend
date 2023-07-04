import { useState } from "react"
import { OmnibarSearch } from "./Omnibar"
import { useNavigate, useOutletContext } from "react-router"

function ProteinSelection(props) {
    const { handleFeatureList } = useOutletContext()
    const [omnibarIsOpen, setOmnibarIsOpen] = useState(true)
    const redirect = useNavigate()
    

    const handleClose = (e, featureURL) => {
        //dont actually close it just redirect
        if (featureURL !== undefined) redirect(featureURL)
        else redirect('/protein')

        
    }
    return (<div>
        
        <OmnibarSearch isOpen={omnibarIsOpen} onSelect={handleFeatureList} onClose={ handleClose}/>
    </div>)
}


export default ProteinSelection

