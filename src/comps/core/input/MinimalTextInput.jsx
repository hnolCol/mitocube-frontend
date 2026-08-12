import _ from "lodash";
import PropTypes from "prop-types";
import { api } from "@/api"
import React from "react";

const AMINO_ACIDS = new Set(["A", "R", "N", "D", "C", "E", "Q", "G", "H", "I", "L", "K", "M", "F", "P", "S", "T", "W", "Y", "V"])
const DNA_BASES = new Set(["A", "T", "C", "G"])


MinimalTextInputComponent.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    style: PropTypes.object,
    optional: PropTypes.bool,
    allowAminoAcidsOnly: PropTypes.bool,
    hint: PropTypes.string,
    checkForMinLength: PropTypes.bool,
    minLength: PropTypes.number,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    suffix_trait_tag: PropTypes.string,
    disabled: PropTypes.bool
}


/**
 * MinimalTextInputComponent component for rendering a minimalistic text input field.
 * @param {Object} props - Component props.
 * @param {String} props.value - The current value of the input field.
 * @param {Function} props.onChange - Callback function to handle value changes.
 * @param {String} [props.placeholder="Type here..."] - Placeholder text for the input field.
 * @param {Object} [props.style={}] - Custom styles for the input field.
 * @param {Boolean} [props.optional=false] - Whether the input is optional.
 * @param {String} [props.hint=""] - Hint text to display below the input field.
 * @param {Boolean} [props.checkForMinLength=false] - Whether to enforce a minimum length.
 * @param {Number} [props.minLength=0] - Minimum length for the input value.
 * @param {String} [props.prefix=""] - Text to display before the input field.
 * @param {String} [props.suffix=""] - Text to display after the input field.   
 * @param {String} [props.suffix_trait_tag=""] - Trait tag to fetch and display as suffix.
 * @param {Boolean} [props.disabled=false] - Whether the input field is disabled.
 * @param {Boolean} [props.allowAminoAcidsOnly=false] - Whether to allow only amino acid characters.
 * @param {Boolean} [props.allowDNAOnly=false] - Whether to allow only DNA base characters.
 * @returns {JSX.Element} The minimal text input component.
 */


function MinimalTextInputComponent({
    value ="",
    onChange,
    placeholder = "Type here...",
    style = {},
    prefix = "",
    suffix = "",
    suffix_trait_tag,
    disabled = false,
    allowAminoAcidsOnly = false,
    allowDNAOnly = false
}) {
    console.log(value)
    const { data: suffixTrait } = api.traits.queryTraits.useGetTraitByTag({ tag: suffix_trait_tag }, { enabled: _.isString(suffix_trait_tag), staleTime: Infinity });

    const handleValueChange = (e) => {
        const newValue = e.target.value;
        if (allowAminoAcidsOnly) {
            if ([...newValue].every(char => AMINO_ACIDS.has(char.toUpperCase()))) {
                onChange(newValue);
            }
        } else if (allowDNAOnly) {
            if ([...newValue].every(char => DNA_BASES.has(char.toUpperCase()))) {
                onChange(newValue);
            }
        } else {
            onChange(newValue);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {prefix && (
                <span style={{ marginRight: "4px", fontSize: "0.75rem", color: "#888" }}>
                    {prefix}
                </span>
            )}
            <input
                type="text"
                value={value}
                onChange={handleValueChange}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    border: "none",
                    borderBottom: "1px solid #ccc",
                    outline: "none",
                    background: "transparent",
                    padding: "3px 0",
                    fontSize: "0.75rem",
                    width: "12rem",
                    ...style
                }}
            />
            {_.isObject(suffixTrait) && (
                <span style={{ marginLeft: "4px", fontSize: "0.75rem", color: "#888" }}>
                    {suffixTrait ? suffixTrait.text : null}
                </span>
            )}
        </div>
    );
}

function areEqual(prevProps, nextProps) {
    if (prevProps.value !== nextProps.value) return false
    if (prevProps.disabled !== nextProps.disabled) return false
    if (prevProps.allowAminoAcidsOnly !== nextProps.allowAminoAcidsOnly) return false
    if (prevProps.allowDNAOnly !== nextProps.allowDNAOnly) return false
    if (prevProps.placeholder !== nextProps.placeholder) return false
    if (!_.isEqual(prevProps.style, nextProps.style)) return false
    if (prevProps.prefix !== nextProps.prefix) return false
    if (prevProps.suffix !== nextProps.suffix) return false
    if (prevProps.suffix_trait_tag !== nextProps.suffix_trait_tag) return false
    return true
        
}       


export const MinimalTextInput = React.memo(MinimalTextInputComponent, areEqual);