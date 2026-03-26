
import _ from "lodash"
import { useState } from "react"
import { AddButton } from "../../core/base/buttons/AddButton"
import { AddGenotypeDialog } from "./AddGentoypeDialog"
import { GenotypeSearch } from "./GenotypeSearch"


export function AdminGenotypes() {
    
    const [dialogProps, setDialogProps] = useState({isOpen : false})

    return (
        <div className="div--expand" >
            
            <AddGenotypeDialog isOpen={dialogProps.isOpen} onClose={() => setDialogProps(prevValues => { return { ...prevValues, isOpen: false } })} />
            <h3>Genotypes</h3>
            <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "2rem" }}>
                <AddButton onSelect={() => setDialogProps(prevValues => { return { ...prevValues, isOpen: true } })} />

                
                <GenotypeSearch />




            </div>
        </div>
    )
}