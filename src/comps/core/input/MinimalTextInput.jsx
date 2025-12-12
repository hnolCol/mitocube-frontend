import hooks from "@mitocube/api-hooks";
import _ from "lodash";
import PropTypes from "prop-types";

MinimalTextInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    style: PropTypes.object,
    optional: PropTypes.bool,
    hint: PropTypes.string,
    checkForMinLength: PropTypes.bool,
    minLength: PropTypes.number,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    suffix_trait_tag: PropTypes.string,
    disabled: PropTypes.bool
}

MinimalTextInput.defaultProps = {
    value: ""
}

/**
 * MinimalTextInput component for rendering a minimalistic text input field.
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
 * @returns {JSX.Element} The minimal text input component.
 */


export function MinimalTextInput({
    value,
    onChange,
    placeholder = "Type here...",
    style = {},
    // optional = false,
    // hint = "",
    // checkForMinLength = false,
    // minLength = 0,
    prefix = "",
    suffix = "",
    suffix_trait_tag,
    disabled = false
}) {
    const { data: suffixTrait } = hooks.traits.useGetTraitByTag({ tag: suffix_trait_tag }, { enabled: _.isString(suffix_trait_tag), staleTime: Infinity });

    const handleValueChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
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
                    width: "100%",
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