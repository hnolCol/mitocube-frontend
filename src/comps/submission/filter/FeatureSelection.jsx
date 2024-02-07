import { useGetSubmissionByQuery } from "../../../hooks/queries/submission.hooks"
import { useState } from "react"
import _ from "lodash"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { FeatureInput } from "../../core/input/api/FeatureInput"




export function FeatureDatasetFilter({ setSubmissionFilter }) {
    
    const [featureSelection, setFeatureSelection] = useState({selectedFeatures : []})
    const { data, isLoading, isFetching, isSuccess, isError, error } = useGetSubmissionByQuery({
        state : 5, //only published dataset
        feature_key: _.join(featureSelection.selectedFeatures.map(feature => feature.key), ";"), //join feature keys 
        enabled: featureSelection.selectedFeatures.length > 0 // only search if a feature is selected. 
    })
   
    const proteome_ids = ["UP000000589", "UP000005640"]
    
    const onFeatureSelection = (attribute, item) => {
        setFeatureSelection(prevValues => {return {...prevValues, selectedFeatures : addItemToArrayOrRemoveItIfPresent({array : prevValues.selectedFeatures, item})}})
    }

    return (
        <div className="intent-margin-top--little" style={{ width: "100%", paddingRight : "0.1rem"}}>
            <h4>Features</h4>
            <div className="flex flex-column" >
                <FeatureInput selectedItems={featureSelection.selectedFeatures} onItemSelect={onFeatureSelection} showLabel={false} proteome_ids={proteome_ids} />
            <div className="font-size--smallest">Datasets in which the feature was found will be displayed.</div>
            </div>
        </div>
    )
}