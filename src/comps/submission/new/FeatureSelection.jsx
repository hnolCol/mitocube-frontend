import { useState } from "react"
import { useGetAnnotationFeatures } from "../../../hooks/queries/annotation.hooks"
import Loading from "../../core/base/loading"
import AttributeInput from "./attribute/MultiSelectAttribute"
import { addItemToArrayOrRemoveItIfPresent } from "../../../services/arrays/transforms"
import { Button } from "@blueprintjs/core"



function FeatureSelection({selectedItems = [], attribute, organisms = [], isSampleAttribute, onSave = undefined, rowIdces = [], genotypeLabel = undefined, entryIdx = 0}) {
    // feature selection for attributes
    console.log(organisms)
    const [selectedFeatures, setSelectedFeatures] = useState(selectedItems)
    const { data: features, isLoading, isFetching } = useGetAnnotationFeatures({organisms })
    const handleFeatureSelection = (attribute, item) => {
        const updatedItem = { ...item, attribute_id: attribute.id, tag: `${item.tag.replace("att_feature",attribute.tag)}` }
        //add remove feature
        setSelectedFeatures(addItemToArrayOrRemoveItIfPresent({ array: selectedFeatures, item: updatedItem }))
    }

    return (
        <div >
        <h3>Feature Selection</h3>
            {isLoading || isFetching ? <Loading /> : <div>
                <p>Features are loaded for {organisms.length} organism. If you are looking for a different one, please specify the organism first in the sample submission sheet.</p>
                <p>{features.length} features loaded.</p>
            
                <AttributeInput attribute={attribute} attributeValues={features}
                    onItemSelect={handleFeatureSelection}
                    selectedItems={selectedFeatures}
                    onRemove={handleFeatureSelection} />
                <div>
                    
                    <Button text="Save" intent="primary" onClick={() => onSave(attribute,selectedFeatures,isSampleAttribute,rowIdces,genotypeLabel,entryIdx)}/>
                    </div>
            </div>}
        </div>
    )
}

export default FeatureSelection