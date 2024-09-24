import { useGetMandatoryAttributes } from "../../hooks/queries/attribute.hooks"
import _ from "lodash"
import { AttributeValueInput } from "../core/input/api/AttributeValueInput"
import { FeatureInput } from "../core/input/api/FeatureInput"
import Loading from "../core/base/loading"


export function MandatoryAttributes({proteome_ids, selectedDatasetAttributes, onAttributeValueSelect}) {

    const { data: attributes, isLoading, isFetching } = useGetMandatoryAttributes()
    
    return (
        <div>
            {isLoading || isFetching ? <Loading /> :
                _.isArray(attributes) ? attributes.map(attribute => {
                    const selectedItems = _.has(selectedDatasetAttributes, attribute.tag) ? selectedDatasetAttributes[attribute.tag] : []
                    if (attribute.has_features_value) {
                        return <FeatureInput key={attribute.tag} {...{ attribute, selectedItems, proteome_ids }} onItemSelect={onAttributeValueSelect} />
                    }
                    return <AttributeValueInput key={attribute.tag} {...{ attribute, selectedItems }} onItemSelect={onAttributeValueSelect} />
                }) : null }
        </div> 
    )
}