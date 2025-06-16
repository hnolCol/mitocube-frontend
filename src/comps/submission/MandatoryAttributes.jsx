import { useGetMandatoryAttributes } from "../../hooks/queries/attribute.hooks"
import _ from "lodash"
import { TraitsInput } from "../core/input/api/TraitsInput"
import { FeatureInput } from "../core/input/api/FeatureInput"
import Loading from "../core/base/loading"


export function MandatoryAttributes({selectedDatasetAttributes, onAttributeValueSelect, submission_state = 0}) {

    const { data: attributes, isLoading, isFetching } = useGetMandatoryAttributes({state : submission_state})
    return (
        <div>
            {isLoading || isFetching ? <Loading /> :
                _.isArray(attributes) ? attributes.map(attribute => {
                    const selected_traits = _.has(selectedDatasetAttributes, attribute.tag) ? selectedDatasetAttributes[attribute.tag] : []
                    // if (attribute.has_features_value) {
                    //     return <FeatureInput key={attribute.tag} {...{ attribute, selectedItems, proteome_ids }} onItemSelect={onAttributeValueSelect} />
                    // }
                    return <TraitsInput key={attribute.tag} {...{ attribute, selected_traits }} onItemSelect={onAttributeValueSelect} />
                }) : null }
        </div> 
    )
}