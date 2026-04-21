import _ from "lodash"
import { api } from "@/api"
import { Select } from "@blueprintjs/select"
import { useState } from "react"
import useDebounce from "@/hooks/useDebounce"
import { ConditionApplicationsView } from "../../base/condition_applications/ConditionApplicationView"
import {motion } from "framer-motion"
import PropTypes from "prop-types"



ConditionApplicationInput.propTypes = {
    selected_ca_tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelect: PropTypes.func.isRequired,
    submission_tag: PropTypes.string,
    attribute_tag: PropTypes.string,
    samples_only: PropTypes.bool
}
export function ConditionApplicationInput({ selected_ca_tags = [], onSelect, submission_tag, attribute_tag, samples_only = true }) {
    const [search, setSearch] = useState("")
    const search_string = useDebounce(search, 300)
    const { data : ca_tags, isLoading } =api.condition_applications.useGetConditionApplicationByQuery({search_string, attribute_tag, submission_tag, samples_only, limit : 30}, { enabled: true })

    const handleCaSelection = (ca_tag) => {
        onSelect(ca_tag)
    }   
    console.log(selected_ca_tags)
    const handleRenderCaItem = (ca_tag, { handleClick, handleFocus, modifiers, query }) => {

        return <div style={{ margin: "0.1rem" }}>
            <motion.button onClick={() => handleClick(ca_tag)} whileHover={{ backgroundColor: "#b6ccf5d8" }} style={{ width: "100%" }} className="basic-button">
                <div className="flex justify-start">
                    {selected_ca_tags.includes(ca_tag) ? <span style={{ marginRight: "0.5rem" }}>✓</span> : null}
                    <ConditionApplicationsView tag={ca_tag} />
                    </div> 
            </motion.button></div>

    }   

    return <Select
        itemRenderer={handleRenderCaItem}
        onItemSelect={handleCaSelection}
        onQueryChange={(query) => setSearch(query)}
        items={_.isArray(ca_tags) && ca_tags.length > 0 ? ca_tags : []} > <button className="basic-button">Select</button> </Select>
}