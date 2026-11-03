import { Annotation } from "./Annotation"
import _ from "lodash";
import { Popover } from "@blueprintjs/core"
import { AnnotationSelectionMenu } from "./AnnotationSelectionMenu";
import { motion } from "framer-motion"
import { StarIcon } from "@/comps/core/svg/icons/StarIcon";

const MARK_COLORS = ["#e6194b", "#3cb44b", "#4363d8", "#f58231", "#911eb4", "#469990", "#f032e6", "#9a6324"]

function AnnotationMarkButton({ annotation_tag, markedColor, onMark }) {
    return <Popover placement="right"
        content={<div className="padding--little" style={{ maxWidth: "10rem" }}>
            <div className="flex flex--wrap" style={{ gap: "0.3rem" }}>
                {MARK_COLORS.map(color => <button key={color}
                    className="flex center-items"
                    style={{ border: "none", outline: "none", background: "transparent", cursor: "pointer", padding: "2px" }}
                    onClick={e => { e.stopPropagation(); onMark(annotation_tag, color) }}>
                    <span style={{ width: "1rem", height: "1rem", borderRadius: "50%", backgroundColor: color, display: "inline-block" }} />
                </button>)}
            </div>
            {markedColor ? <button className="basic-button--small div--expand margin-top--little"
                onClick={e => { e.stopPropagation(); onMark(annotation_tag, undefined) }}>
                Remove mark
            </button> : null}
        </div>}>
        <button
            title="Mark annotation with a color in the volcano plots"
            style={{ border: "none", outline: "none", background: "transparent", cursor: "pointer", padding: "0 2px" }}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}>
            <span style={{
                width: "0.85rem", height: "0.85rem", borderRadius: "50%", display: "inline-block",
                backgroundColor: markedColor || "transparent",
                border: markedColor ? "none" : "1px dashed #999"
            }} />
        </button>
    </Popover>
}

export function FavoriteAnnotationSelection({ 
    selected = [],
    highlighted = [],
    onAdd,
    onSelect,
    onHover,
    onMark,
    marked = [],
    maxHeight = "300px",
    submission_tags = []
}) {
    return (
        <div>
            <div className="flex center-items padding--small gap--tiny">
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
                    <motion.div
                        key={annotation_tag}
                        role="button"
                        onHoverStart={_.isFunction(onHover) ? () => onHover(annotation_tag) : undefined}
                        onHoverEnd={_.isFunction(onHover) ? () => onHover(undefined) : undefined}
                        className="flex center-items"
                        style={{ border: "none", backgroundColor: "transparent", color: "#000000", gap: "0.2rem", width: "100%", outline: "none", cursor: "pointer", fontWeight: highlighted.includes(annotation_tag) ? "bold" : "normal" }}
                        onClick={() => onSelect(annotation_tag)}
                    >
                        <StarIcon 
                            filled={highlighted.includes(annotation_tag)} 
                            color={highlighted.includes(annotation_tag) ? "#f5b301" : "#ccc"} 
                            size={24} 
                        />
                        {_.isFunction(onMark)
                            ? <AnnotationMarkButton
                                annotation_tag={annotation_tag}
                                markedColor={marked.find(m => m.tag === annotation_tag)?.color}
                                onMark={onMark} />
                            : null}
                        <Annotation tag={annotation_tag} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}