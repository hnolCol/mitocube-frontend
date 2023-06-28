import { useState } from "react"
import { OmnibarSearch } from "./Omnibar"
import { useNavigate, useOutletContext } from "react-router"

function ProteinSelection(props) {
    const { setFeatureList } = useOutletContext()
    const [omnibarIsOpen, setOmnibarIsOpen] = useState(true)
    const redirect = useNavigate()

    const handleClose = (e, featureURL) => {
        console.log(featureURL)
        //dont actually close it just redirect
        if (featureURL !== undefined) redirect(featureURL)
        else redirect('/protein')

        
    }
    return (<div>
        
        <OmnibarSearch isOpen={omnibarIsOpen} onSelect={setFeatureList} onClose={ handleClose}/>
    </div>)
}


export default ProteinSelection

