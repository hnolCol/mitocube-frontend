import { useState } from "react"
import _ from "lodash"
import { motion } from "framer-motion"
import { ProcedureItem } from "./ProcedureItem"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"

export function ProcedureContainer({ tags, updateProcedureList }) {

    const [showDetailTags, setShowDetailsTags] = useState([])

    const handleClick = (e, tag) => {
        e.stopPropagation()
         if (!_.isString(tag)) return
            const detailTags = addStringToArrayOrRemove({array : showDetailTags.slice(), string : tag})
            setShowDetailsTags(detailTags)
    }
    return (
        <div className="flex flex-column container--scroll-y-large">
            {tags.map((tag, idx) => (
                <div key={`${tag}-${idx}`} className="flex margin-bottom--little">
                <motion.div
                    className="flex"
                    role="button"
                    tabIndex={0}
                    whileHover={{ backgroundColor: "#efefef" }}
                    onClick={(e) => handleClick(e, tag)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleClick(e, tag)
                        }
                    }}
                    style={{ backgroundColor: "#fff", borderRadius: "6px", border: "none", width: "100%", cursor: "pointer" }}
                >
                    <ProcedureItem 
                        procedure_tag={tag} 
                        updateProcedureList={updateProcedureList}  
                        showDetails={showDetailTags.includes(tag)} />
                </motion.div>
                </div>
            ))}
        </div>
    )
}
