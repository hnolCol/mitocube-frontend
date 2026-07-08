

import { TraitWithValueInput } from '../base/tags/TraitWithValueInput';
import { AttributeTraitSelection } from '../base/attributes/AttributeTraitSelection';
import _ from 'lodash'; 

export function InsertGeneticApplication({selectedTraits, handleTraitSelection, getSelectionByPath, handleSelection, getTraitSelection, checkAttributeRequiredTraits, referenceID, handleRemoveByPath}) {

    const trait_selection = getSelectionByPath([{ "type": "attribute", "tag": 'att_gene_engineering', "id": referenceID }])
    const selected = _.isString(getTraitSelection(referenceID))

    return (<div>
        
        <AttributeTraitSelection
            attribute_tag='att_gene_engineering'
            onChange={trait_tag => handleTraitSelection(trait_tag, referenceID)}
            selected_traits={_.isArray(trait_selection) ? trait_selection.map(c => c.tag) : []} />
        
        {selected ? null : <div className='font-size--small'> Select traits for gene engineering attribute</div>}

        {selected ?
            <TraitWithValueInput
                attribute_tag='att_gene_engineering'
                trait_tag={getTraitSelection(referenceID)}
                getSelectionByPath={getSelectionByPath}
                onChildrenSelection={handleSelection}
                referenceID={referenceID}
                onRemove={handleRemoveByPath}
            /> : null}

    </div >)


}

