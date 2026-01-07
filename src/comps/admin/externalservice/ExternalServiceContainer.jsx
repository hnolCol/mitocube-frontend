import { useState } from "react"
import _ from "lodash"
import { motion } from "framer-motion"
import { ExternalServiceItem } from "./ExternalServiceItem"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"

export function ExternalServiceContainer({ tags, updateExternalServiceList }) {

    const [showDetailTags, setShowDetailsTags] = useState([])

    const handleClick = (e, tag) => {
        e.stopPropagation()
         if (!_.isString(tag)) return
            const detailTags = addStringToArrayOrRemove({array : showDetailTags.slice(), string : tag})
            setShowDetailsTags(detailTags)
    }
    console.log(tags)
    return (
        <div style={{ height: "70vh", overflowY: "scroll", paddingBottom: "2rem" }} className="flex flex-column">
            {tags.map((tag, idx) => (
                <div  key={`${tag}-${idx}`} className="flex" style={{ marginBottom: "0.8rem" }}>
                <motion.button
                    className="flex"
                    whileHover={{ backgroundColor: "#efefef" }}
                    onClick={(e) => handleClick(e, tag)}
                    style={{ backgroundColor: "#fff", borderRadius: "6px", border: "none", width: "100%"}}
                >
                    <ExternalServiceItem 
                    tag={tag}
                    updateExternalServiceList={updateExternalServiceList}
                    showDetails={showDetailTags.includes(tag)} />
                </motion.button>
                </div>
            ))}
        </div>
    )
}

