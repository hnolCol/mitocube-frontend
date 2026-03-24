

import { TraitWithValueInput } from '../base/tags/TagWithTooltip';
import { AttributeTraitSelection } from '../base/attributes/AttributeTraitSelection';
import _ from 'lodash'; 

export function InsertGeneticApplication({selectedTraits, handleTraitSelection, getSelectionByPath, handleSelection, getTraitSelection, checkAttributeRequiredTraits, referenceID, handleRemoveByPath}) {

    const trait_selection = getSelectionByPath([{ "type": "attribute", "tag": 'att_gene_engineering', "id": referenceID }])
    const selected = _.isString(getTraitSelection(referenceID))

    return (<div>
        
        <AttributeTraitSelection
            attribute_tag='att_gene_engineering'
            onChange={trait => handleTraitSelection(trait.tag, referenceID)}
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
                checkAttributeRequiredTraits={checkAttributeRequiredTraits}
                addIDToAttribute={false}
                respect_single_child_level={true}
                
            /> : null}

    </div >)


}

