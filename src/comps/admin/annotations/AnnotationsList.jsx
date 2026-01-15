import { useState } from "react"
import hooks from "@mitocube/api-hooks"
import _ from "lodash"
import { AddAnnotationDialog } from "./AddAnnotationsDialog"

export function AnnotationsList({ tag }) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    data: annotations = [],
    isLoading,
    isError,
    error,
  } = hooks.annotations.useGetAnnotationsByGroupTag(
    { tag },
    { enabled: _.isString(tag) }
  )

  return (
    <div className="right-panel">
      <div className="panel-header">
        <h4>Annotations</h4>

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

        {!isLoading && !annotations.length && (
          <div className="muted">No annotations found.</div>
        )}
        
        {annotations.map(a => (
          <div key={a.group_tag} className="annotation-item">
            <strong>{a.text}</strong>

            {a.description && (
              <div className="muted">{a.description}</div>
            )}

            {a.protein_tags?.length > 0 && (
              <div className="muted">
                Proteins: {a.protein_tags.join(", ")}
              </div>
            )}
          </div>
        ))}

      </div>

      <AddAnnotationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

