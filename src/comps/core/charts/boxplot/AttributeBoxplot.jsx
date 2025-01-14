import { useState } from "react";
import { MinimalAttributeSelection } from "../../base/attributes/MinimalAttributeSelection";



export function AttributeBoxplot({ }) {
    
    const [attribute, setAttribute] = useState({}) 



    return (
        <div>
            <h2>BUm</h2>
            <MinimalAttributeSelection onAttributeSelect={(attribute => setAttribute(attribute))} selectedItem={attribute}/>
        </div>
    )



}