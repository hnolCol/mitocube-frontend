import { HIGHLIGHT_COLOR } from "../../colors/colorPalette"

export function Checkbox({ label, checked, onChange }) {

    return <label
        style={{
            display: "flex", 
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            userSelect: "none",
            fontFamily: "Inter, sans-serif",
            color: "#000000",
        }}
    >
        <div
            style={{
                position: "relative",
                width: "20px",
                height: "20px",
            }}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                style={{
                    position: "absolute",
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    margin: 0,
                    cursor: "pointer",
                }}
            />

            <div
                style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    background: checked ? HIGHLIGHT_COLOR : "#efefef",
                    border: `1px solid ${checked ? HIGHLIGHT_COLOR : "#52525b"
                        }`,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                }}
            >
                <svg
                    viewBox="0 0 24 24"
                    width="12px"
                    height="12px"
                    style={{
                        stroke: "white",
                        strokeWidth: 3,
                        fill: "none",
                        opacity: checked ? 1 : 0,
                        transform: checked ? "scale(1)" : "scale(0.7)",
                        transition: "all 0.2s ease",
                    }}
                >
                    <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>

        <span
            style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                opacity: 1,
            }}
        >
            {label}
        </span>
    </label>
}
