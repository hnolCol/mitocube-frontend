import _ from "lodash"
import { useState } from "react"
import { addStringToArrayOrRemove } from "../../../services/arrays/transforms"
import { PhenotypeAssociationItem } from "./PhenotypeAssociationItem"

export function PhenotypeAssociationContainer({ tags, updateList }) {
    const [showDetailTags, setShowDetailTags] = useState([])

    const handleClick = (e, tag) => {
        e.stopPropagation()
        if (!_.isString(tag)) return
        setShowDetailTags(prev => addStringToArrayOrRemove({ array: prev.slice(), string: tag }))
    }

    return (
        <div className="flex flex-column container--scroll-y-large">
            {tags.map((tag, idx) => (
                <div key={`${tag}-${idx}`} className="flex margin-bottom--little">
                    <button
                        className="flex"
                        onClick={(e) => handleClick(e, tag)}
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            width: "100%",
                            cursor: "pointer",
                            textAlign: "left",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#efefef"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}
                    >
                        <PhenotypeAssociationItem
                            tag={tag}
                            showDetails={showDetailTags.includes(tag)}
                            updateList={updateList}
                        />
                    </button>
                </div>
            ))}
        </div>
    )
}