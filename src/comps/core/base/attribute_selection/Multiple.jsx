import { useState } from "react"
import _ from "lodash"
import { Button } from "@blueprintjs/core"
import { getRandomString } from "../../../../services/random"
import { Combobox } from "../../input/Combobox"



/**
 * @description A JSX Component that allow the user to select multiple sample attributes. Likely to be used for a selection for statistical tests that utilize numerous factors such as linear mixed models or an N-WAY ANOVA.
 * @param {Object} props
 * @param {import("../../../../types/attributes").SampleAttributes} props.samplesAttributes - The sample attributes that contain the attribute. 
 * @param {Function} props.onSelection - The function to be called on selection. 
 * @returns A JSX Element for the selection of n sample attributes.  
 */
export function MultipleSampleAttributeSelection({samplesAttributes, onSelection}) {
    const [selectionLabels, setSelectionLabel] = useState([getRandomString()])
    const [sampleAttributeSelection, setSampleAttributeSelection] = useState({})

    const samplesAttributesNames = _.values(samplesAttributes).map(item => { return {
        text : item.name, 
        description : _.join(_.keys(item.values), ", ") //description as the joined string of the attribute values
    }})

    return(
        <div>
            <h3>Sample Attribute Selection</h3>
            {selectionLabels.map(selectionLabel => <div className="flex">
                <Combobox 
                    items={samplesAttributesNames}
                    labelKey="description"
                    textKEy="text"
                    callbackKey={selectionLabel} 
                    value={sampleAttributeSelection[selectionLabel]}
                    onChange={(selectionLabel,item) => setSampleAttributeSelection(prevValues => {return {...prevValues, [selectionLabel] : item.name}})}/>
                <Button 
                icon="remove" 
                small={true} 
                minimal={true} 
                onClick={(selectionLabel) => setSelectionLabel(prevValues => _.remove(prevValues, item => item === selectionLabel))}/>

            </div>)}
            <Button 
            icon="add" 
            small={true} 
            minimal={true} 
            onClick={() => setSelectionLabel(prevValues => [...prevValues,getRandomString()])}/>


        </div>
    )
}