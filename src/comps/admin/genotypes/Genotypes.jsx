
import _ from "lodash"
import { useState } from "react"
import { AddButton } from "../../core/base/buttons/AddButton"
import { AddGenotypeDialog } from "./AddGentoypeDialog"
import { GenotypeSearch } from "./GenotypeSearch"


// export function AdminGenotypes() {
    
//     const [dialogProps, setDialogProps] = useState({isOpen : false})

//     return (
//         <div className="div--expand" >
            
//             <AddGenotypeDialog 
//                 isOpen={dialogProps.isOpen} 
//                 onClose={() => {
//                     setDialogProps(prevValues => ({ ...prevValues, isOpen: false }))
//                     console.log("calling updateGenotypeList")

//                     updateGenotypeList()
//                 }} 
//             />
//             <h3>Genotypes</h3>
//             <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "2rem" }}>
//                 <AddButton onSelect={() => setDialogProps(prevValues => { return { ...prevValues, isOpen: true } })} />

                
//                 <GenotypeSearch />




//             </div>
//         </div>
//     )
// }


export function AdminGenotypes() {
    const [dialogProps, setDialogProps] = useState({ isOpen: false })
    const [refreshKey, setRefreshKey] = useState(0)

    return (
        <div className="div--expand">
            <AddGenotypeDialog
                isOpen={dialogProps.isOpen}
                onClose={() => {
                    setDialogProps(prevValues => ({ ...prevValues, isOpen: false }))
                    setRefreshKey(k => k + 1)
                }}
            />
            <h3>Genotypes</h3>
            <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "2rem" }}>
                <AddButton onSelect={() => setDialogProps(prevValues => ({ ...prevValues, isOpen: true }))} />
                <GenotypeSearch key={refreshKey} />
            </div>
        </div>
    )
}