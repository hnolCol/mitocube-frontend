import {motion } from "framer-motion"

export function AddButton({fontColor = "#00000", onSelect, isLoading, disabled = false}) {
    
    return <motion.button
        disabled={isLoading || disabled}
            whileHover={{backgroundColor : "#fff"}}
            className="action-button"
            aria-label="Add Metatext"
            onClick={onSelect}
        >
            <span style={{ fontWeight: "bold", lineHeight: "1" }}>+</span>
        </motion.button>
}