import { TraitInput } from "../../input/api/TraitInput";
import { MinimalTraitSelection } from "../traits/MinimalTraitSelection";
import { Attribute } from "./Attribute";


/**
 * @description Minimal selection of a trait for an attribute.
 * @param {Object} props 
 * @param {String} props.attribute_tag 
 * @param {String[]} props.selected_traits Array of trait tags that are selected 
 * @param {Function} props.onChange The function called upon item selection. Should take the trait as an input.
 * @returns 
 */
export function AttributeTraitSelection({attribute_tag, selected_traits = [], onChange}) {

    return (
        <div className="flex">
            <Attribute attribute_tag={attribute_tag} />
            <TraitInput attribute_tag={attribute_tag} onItemSelect={(attribute_tag, trait_tag) => onChange(trait_tag)} selected_traits={selected_traits} descriptionWidth = "12rem"/>
            {/* <MinimalTraitSelection attribute_tag={attribute_tag} onChange={onChange} selected_traits={selected_traits} /> */}
        </div>
    )
}