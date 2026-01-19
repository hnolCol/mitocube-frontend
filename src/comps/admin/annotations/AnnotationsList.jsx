import { useState } from "react"
import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { AddAnnotationDialog } from "./AddAnnotationsDialog"

function AnnotationItem({ tag }) {
  const { data: annotation, isSuccess } =
    hooks.annotations.useGetAnnotationsByTag(
      { tag },
      { enabled: _.isString(tag) }
    )

  const { data: proteinCount } =
    hooks.annotations.useGetAnnotationProteinCount(
      { tag },
      { enabled: _.isString(tag) }
    )
  console.log(tag, proteinCount)
  if (!isSuccess) return null

  return (
    <div 
      style={{
        padding: "0.6rem",
        marginBottom: "0.4rem",
        borderRadius: "6px",
        backgroundColor: "#f7f7f7",
        border: "1px solid #ddd",
      }}
    > 

      <strong>{annotation.text}</strong>

      {annotation.description && (
        <div style={{ fontSize: "0.75rem", color: "#666"}}>
          {annotation.description}
          </div>
      )}

      <div style={{ fontSize: "0.75rem", color: "#666"}}>
        {proteinCount ?? 0 } proteins
      </div>
    </div>
  )
}


export function AnnotationsList({ tag }) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    data: annotationTags = [],
    isLoading,
    isError,
    error,
  } = hooks.annotations.useGetAnnotationsByGroupTag(
    { tag },
    { enabled: _.isString(tag) }
  )
  


  return (
    <div className="right-panel">
      <div
        className="panel-header"
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
        }}
        >
        <h4 style={{ margin: 0 }}>Annotations</h4>

        <button
            className="basic-button"
            onClick={() => setIsOpen(true)}
        >
            + Add Annotation
        </button>
        </div>


      <div className="annotation-list">
        {isLoading && <div>Loading annotations…</div>}

        {isError && (
          <div style={{ color: "red" }}>
            {error?.message ?? "Failed to load annotations"}
          </div>
        )}
        

        {!isLoading && !annotationTags.length && (
          <div className="muted">No annotations found.</div>
        )}

        {annotationTags.map(tag => (
          <AnnotationItem key={tag} tag={tag} />
        ))}
      </div>

      <AddAnnotationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        group_tag={tag}
      />
    </div>
  )
}
