import _ from "lodash"
import { useState } from "react"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import { motion } from "framer-motion"
import { ResearchGroupItem } from "./ResearchGroupItem"

export function ResearchGroupContainer({ tags, updateResearchGroupList, setEditUsersDialog }) {

  const [showDetailTags, setShowDetailsTags] = useState([])

  const handleClick = (e, tag) => {
    e.stopPropagation()
    if (!_.isString(tag)) return
    const detailTags = addStringToArrayOrRemove({array : showDetailTags.slice(), string : tag})
    setShowDetailsTags(detailTags)
}

return (
    <div style={{ overflowY: "auto", paddingBottom: "5rem", paddingRight: "0.5rem" }} className="flex flex-column">
        {_.isArray(tags) && tags.length > 0 ? tags.map((tag, idx) => (
            <div key={`${tag}-${idx}`} className="flex" style={{ marginBottom: "0.8rem" }}>
                <motion.button
                    className="flex"
                    whileHover={{ backgroundColor: "#efefef" }}
                    onClick={(e) => handleClick(e, tag)}
                    style={{ backgroundColor: "#fff", borderRadius: "6px", border: "none", width: "100%" }}
                >
                    <ResearchGroupItem tag={tag} setEditUsersDialog={setEditUsersDialog} />
                </motion.button>
            </div>
        )) : null}
      </div>
  ) 
}
