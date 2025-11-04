import { motion } from "framer-motion";
import {  PropTypes, func, node } from "prop-types";
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";

OptionButton.propTypes = {
    onClick: func.isRequired,
    children: PropTypes.node.isRequired,
    isSelected: PropTypes.bool,
};
    
OptionButton.defaultProps = {
    isSelected: false,
};
/**
 * @description A button component that can be used as an option selector. It accepts an onClick function, children as the content of the button, and a boolean isSelected to determine if the button is currently selected
 * @param {Object} props 
 * @param {function} props.onClick - The function to call when the button is clicked.
 * @param {React.ReactNode} props.children - The content to display inside the button.
 * @param {boolean} props.isSelected - Whether the button is selected or not, used to style the button differently when selected. 
 * @returns 
 */
export function OptionButton({ onClick, children, isSelected }) {
    
    return (
        <motion.button
            className="padding--little margin-left--little"
            whileHover={{ scale: 1.1    }}
            style={{
                backgroundColor: "#f9f9f9",
                borderRadius: "5px",
                border: "none",
                outline: "none",
                fontWeight : isSelected ? "bold" : "normal",
                color: isSelected ? HIGHLIGHT_COLOR : "#666",
            }}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
}

