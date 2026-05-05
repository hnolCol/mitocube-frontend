

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
    placeholder: PropTypes.string
}
export function BaseInput({ render_children, api_hook, onSelect, selected_tags, placeholder = "Select", api_hook_params = {} }) {
    const [search, setSearch] = useState("")
    const search_string = useDebounce(search, 300)
    const { data: item_tags, } = api_hook({ search_string, ...api_hook_params }, { enabled: true })
    const handleRenderItem = (tag, { handleClick, handleFocus, modifiers, query }) => {
        return <div key={tag}  style={{ margin: "0.1rem" }}>
                        
            <motion.button
                whileHover={{ backgroundColor: "#b6ccf5d8" }}
                onClick={() => handleClick(tag)}
                style={{ width: "100%" }}
                    className="basic-button">
                    <div className="flex justify-start">
                        {selected_tags.includes(tag) ? <span style={{ marginRight: "0.5rem" }}>✓</span> : null}
                        {render_children(tag)}
                        </div>
            </motion.button>
            </div>
    }
    
    const handleSelect = (tag) => {
        onSelect(tag)
    }

    return <Select
        items={_.isArray(item_tags) ? item_tags : []} itemRenderer={handleRenderItem}
        onItemSelect={handleSelect}
        onQueryChange={(query) => setSearch(query)}>
        <button className="basic-button">{placeholder}</button>
    </Select>

}


// import { api } from "@/api"
// import { SubmissionTitle } from "@/comps/submission/view/SubmissionTitle"
// import { Select } from "@blueprintjs/select"
// import { useState } from "react" 
// import PropTypes from "prop-types" 
// import useDebounce from "@/hooks/useDebounce"
// import _ from "lodash" 
// import { motion } from "framer-motion"

// SubmissionInput.propTypes = {
//     selected_submission_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
//     onSelect: PropTypes.func.isRequired
// }
// export function SubmissionInput({ selected_submission_tags = [], onSelect }) {
//     const [search, setSearch] = useState("")
//     const search_string = useDebounce(search, 300)

//     const { data: submission_tags, isLoading } = api.submissions.query.useGetSubmissionByQuery({search_string, group_by_state : false}, { enabled: true })

//     const handleSubmissionSelection = (submission_tag) => {
//         onSelect(submission_tag);
//     }   

//     const handleRenderSubmissionItem = (submission_tag, { handleClick, handleFocus, modifiers, query }) => {

//         return <div className="flex center-items" style={{ margin: "0.1rem" }}>

//         </div>

//     }   



//     return <Select
//         itemRenderer={handleRenderSubmissionItem}
//         onItemSelect={handleSubmissionSelection}
//         onQueryChange={(query) => setSearch(query)}
//         items={_.isArray(submission_tags) && submission_tags.length > 0 ? submission_tags : []} > <button className="basic-button">Select</button> </Select>
// }