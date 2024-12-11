import { useGetValueForAttributeByTag } from "../../../../hooks/queries/attribute.hooks"
import { Combobox } from "../../input/Combobox"


/**
 * 
 * @param {Object} props 
 * @param {String} props.attribute_tag 
 * @param {Function} props.onChange  
 * @returns 
 */
export function MinimalTraitSelection({attribute_tag, onChange, selected_traits}) {

    const { data : traits, isLoading, isFetching} = useGetValueForAttributeByTag({tag : attribute_tag})

    if (isLoading || isFetching) return null 
    return <div>
        <Combobox
            small
            selectedItems= {selected_traits}
            onChange={(item) => onChange(item)}
            items={traits}
            textKey="text"
            labelKey="description"
            buttonProps={{
                text : `${""}\u25BC`,
                minimal: true,
                small: true,
                intent: selected_traits.length > 0 ? "primary" : "danger",//hasValue? "primary" : "warning",
                style: {
                    marginLeft: "0px",
                    marginRight: "3px",
                    paddingLeft: "0px",
                    paddingRight: "0.0px"
                }
            }} /></div>
}