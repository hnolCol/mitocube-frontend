import { Annotation } from "./Annotation"
import _ from "lodash";
import { AnnotationSelectionMenu } from "./AnnotationSelectionMenu";
import { motion } from "framer-motion"
import { StarIcon } from "@/comps/core/svg/icons/StarIcon";

export function FavoriteAnnotationSelection({ 
    selected = [],
    highlighted = [],
    onAdd,
    onSelect,
    onHover,
    maxHeight = "300px",
    submission_tags = []
}) {
    return (
        <div>
            <div className="flex center-items padding--small" style={{gap: "0.2rem"}}>
                <AnnotationSelectionMenu 
                    placeholder="Select annotations"
                    onSelection={(e, tags) => {
                        if (Array.isArray(tags)) return
                        onAdd(tags)
                    }}
                    onRemove={(e, tag) => onAdd(tag)}
                    selected_tags={selected}
                    showTags={false}
                    submission_tags={submission_tags}
                />
                {selected.length > 0 && (
                    <button className="basic-button" onClick={() => selected.forEach(tag => onAdd(tag))}>
                        Clear
                    </button>
                )}
            </div>
            <div className="flex flex-column" style={{maxHeight, overflowY: "scroll", gap: "0.2rem"}}>
                {selected.map(annotation_tag => (
                    <motion.button
                        key={annotation_tag}
                        onHoverStart={_.isFunction(onHover) ? () => onHover(annotation_tag) : undefined}
                        onHoverEnd={_.isFunction(onHover) ? () => onHover(undefined) : undefined}
                        className="flex center-items"
                        style={{ border: "none", backgroundColor: "transparent", color: "#000000", gap: "0.2rem", width: "100%", outline: "none", fontWeight: highlighted.includes(annotation_tag) ? "bold" : "normal" }}
                        onClick={() => onSelect(annotation_tag)}
                    >
                        <StarIcon 
                            filled={highlighted.includes(annotation_tag)} 
                            color={highlighted.includes(annotation_tag) ? "#f5b301" : "#ccc"} 
                            size={24} 
                        />
                        <Annotation tag={annotation_tag} />
                    </motion.button>
                ))}
            </div>
        </div>
    )
}