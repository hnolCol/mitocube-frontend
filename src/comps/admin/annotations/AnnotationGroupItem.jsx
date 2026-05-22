import { api } from "@/api"
import _ from "lodash"
import { Tooltip } from "@blueprintjs/core"
import { Button } from "@blueprintjs/core"
import { useState } from "react"                                          
import { EditAnnotationGroupDialog } from "./EditAnnotationGroupDialog"   

export function AnnotationGroupItem({ tag, onClick, isSelected }) {
    const [isEditOpen, setIsEditOpen] = useState(false)                 

    const { data: group, isSuccess, refetch } = api.annotations.queryAnnotations.useGetAnnotationGroupByTag(
        { tag },
        { enabled: _.isString(tag) }
    );
    const { data: count } = api.annotations.queryAnnotations.useGetAnnotationGroupCount(
        { tag },
        { enabled: _.isString(tag) }
    )
    const { mutate: updateGroup, isLoading } = api.annotations.modifyAnnotations.useUpdateAnnotationGroup({ tag });

    if (!isSuccess) return null;

    const hoverContent = group.created_at && group.created_by ? (
        <div style={{ fontSize: "0.75rem" }}>
            Created by {group.created_by}<br />
            {new Date(group.created_at).toLocaleDateString()}
        </div>
    ) : null;

    return (
        <Tooltip content={hoverContent} hoverOpenDelay={300} disabled={!hoverContent}>
            <div
                onClick={onClick}
                style={{
                    padding: "0.6rem",
                    marginBottom: "0.4rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#e8f0ff" : "#f7f7f7",
                    border: isSelected ? "1px solid #3f6ad8" : "1px solid #ddd",
                }}
            >
                <EditAnnotationGroupDialog
                    isOpen={isEditOpen}
                    tag={tag}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={refetch}
                />

                <div style={{ float: "right", display: "flex", gap: "0.4rem" }}>
                    <Button
                        className="basic-button"
                        onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
                        style={{ fontSize: "0.75rem" }}
                    >
                        Edit
                    </Button>
                    <Button
                      className="basic-button"
                      disabled={isLoading || !group.url}
                      onClick={(e) => {
                          e.stopPropagation();
                          updateGroup({ tag }, {
                              onSuccess: () => console.log("Annotation group updated from URL"),
                              onError: (err) => console.error("Failed to update annotation group", err),
                          });
                      }}
                      style={{ float: "right", fontSize: "0.75rem", padding: "2px 8px" }}  
                  >
                      Update
                  </Button>
                </div>

                <strong>{group.text}</strong>
                <div style={{ fontSize: "0.75rem", color: "#666" }}>{group.description}</div>
                <div style={{ fontSize: "0.75rem", color: "#444", marginTop: "0.25rem" }}>
                    {count ?? 0} annotations
                </div>
            </div>
        </Tooltip>
    );
}