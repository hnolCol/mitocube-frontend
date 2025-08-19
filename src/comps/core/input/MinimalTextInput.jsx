import hooks from "@mitocube/api-hooks";
import _ from "lodash";

export function MinimalTextInput({
    value,
    onChange,
    placeholder = "Type here...",
    style = {},
    optional = false,
    hint = "",
    checkForMinLength = false,
    minLength = 0,
    prefix = "",
    suffix = "",
    suffix_trait_tag
}) {

    const { data: suffixTrait } = hooks.traits.useGetTraitByTag({ tag: suffix_trait_tag }, { enabled: !!suffix_trait_tag });

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