import { useGetSubmissionByQuery } from "../../../hooks/queries/submission.hooks"
import { useEffect, useState } from "react"
import _ from "lodash"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { GenotypeInput } from "../../core/input/api/GenotypeInput"

export function GenotypeDatasetFilter({ setSubmissionFilter }) {
    
    const [genotypeSelection, setGenotypeSelection] = useState({selectedGenotypes : []})
    // const { data, isLoading, isFetching, isSuccess, isError, error } = useGetSubmissionByQuery({
    //     state : 5, //only published dataset
    //     feature_key: _.join(featureSelection.selectedFeatures.map(feature => feature.key), ";"), //join feature keys 
    //     enabled: featureSelection.selectedFeatures.length > 0 // only search if a feature is selected. 
    // })
       
    const onGenotypeSelection = (attribute, item) => {
        setGenotypeSelection(prevValues => {return {...prevValues, selectedGenotypes : addItemToArrayOrRemoveItIfPresent({array : prevValues.selectedGenotypes, item})}})
    }

    useEffect(() => {
        setSubmissionFilter(prevValues => { return { ...prevValues, genotype_label :  genotypeSelection.selectedGenotypes}})

    },[_.join(genotypeSelection.selectedGenotypes)])

    return (
        <div className="intent-margin-top--little" style={{ width: "100%", paddingRight : "0.1rem"}}>
            <h4>Genotypes</h4>
            <div className="flex flex-column" >
                <GenotypeInput selectedItems={genotypeSelection.selectedGenotypes} onItemSelect={onGenotypeSelection}/>
            <div className="font-size--smallest">Datasets in which the genotype was utilized will be displayed.</div>
            </div>
        </div>
    )
}