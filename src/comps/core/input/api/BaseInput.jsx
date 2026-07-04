

import { Select } from "@blueprintjs/select"
import { useState } from "react" 
import PropTypes from "prop-types" 
import useDebounce from "@/hooks/useDebounce"
import _ from "lodash" 
import { motion } from "framer-motion"
import { HIGHLIGHT_COLOR } from "../../colors/colorPalette";


BaseInput.propTypes = {
    render_children: PropTypes.func.isRequired,
    api_hook: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    selected_tags: PropTypes.arrayOf(PropTypes.string),
    placeholder: PropTypes.string,
    minimal: PropTypes.bool
}
export function BaseInput({ render_children, api_hook, onSelect, selected_tags, placeholder = "Select", api_hook_params = {} , fill = true, minimal = false}) {
    const [search, setSearch] = useState("")
    const search_string = useDebounce(search, 300)
    const { data: item_tags, } = api_hook({ search_string, ...api_hook_params }, { enabled: true })
    const handleRenderItem = (tag, { handleClick, handleFocus, modifiers, query }) => {
        return <div key={tag}  style={{ margin: "0.1rem" }}>
                        
            <motion.button
                whileHover={{ backgroundColor: "#b6ccf5d8" }}
                onClick={() => handleClick(tag)}
                style={{ width: "100%" }}
                    className={`${minimal ? "basic-button--small" : "basic-button"}`}>
                    <div className="flex justify-start">
                        {selected_tags.includes(tag) ? <span style={{ marginRight: "0.5rem" }}>✓</span> : null}
                        {render_children(tag)}
                        </div>
            </motion.button>
            </div>
    }
    
    const handleSelect = (tag) => {
        console.log(tag)
        onSelect(tag)
    }

    return <Select  
        
        items={_.isArray(item_tags) ? item_tags : []} itemRenderer={handleRenderItem}
        onItemSelect={handleSelect}
        onQueryChange={(query) => setSearch(query)}>
        <button style={{width : fill ? "100%" : "auto"}} className={`${minimal ? "basic-button--small" : "basic-button"}`}>{placeholder}</button>
    </Select>

}
