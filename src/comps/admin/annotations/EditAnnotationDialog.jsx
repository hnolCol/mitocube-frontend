import { api } from "@/api"
import { useEffect, useState } from "react"
import _ from "lodash"
import { AnnotationGroupInput } from "./AnnotationGroupInput"
import { AnnotationUpload } from "./AnnotationFileUpload"
import { Dialog } from "@blueprintjs/core"

const INITIAL_ANNOTATION = {
  text: "",
  description: "",
  publication: "",
  pubmed_id: "",
  source: "",
  protein_tags: [],
  group_tag: "",
}

export function EditAnnotations({ isOpen, onClose, tag, onSuccess }) {
  const [annotation, setAnnotation] = useState(INITIAL_ANNOTATION)

  const {
    data: existingAnnotation,
    isSuccess,
  } = api.annotations.queryAnnotations.useGetAnnotationsByTag(
    { tag },
    { enabled: _.isString(tag) && isOpen }
  )
  // console.log("Existing Annotation:", existingAnnotation)

  const {
    mutate: updateAnnotation,
    isLoading,
    isError,
    error,
  } = api.annotations.modifyAnnotations.useUpdateAnnotations()

  useEffect(() => {
    if (isSuccess && existingAnnotation) {
      setAnnotation({
        text: existingAnnotation.text ?? "",
        description: existingAnnotation.description ?? "",
        publication: existingAnnotation.publication ?? "",
        pubmed_id: existingAnnotation.pubmed_id ?? "",
        source: existingAnnotation.source ?? "",
        protein_tags: existingAnnotation.protein_tags ?? [],
        group_tag: existingAnnotation.group_tag ?? "",
      })
    }
  }, [isSuccess, existingAnnotation])

  if (!isOpen || !isSuccess) return null

  const handleProteinIdsLoaded = (ids) => {
    setAnnotation((prev) => ({
      ...prev,
      protein_tags: Array.from(new Set([...prev.protein_tags, ...ids])),
    }))
  }

  const editAnnotation = () => {
    const data = {
      tag,
      ...annotation,
      protein_tags: annotation.protein_tags
      .flatMap(t => t.split(";"))
      .map(t => t.trim())
      .filter(Boolean),
    }

    updateAnnotation(data, {
      onSuccess: () => {
        onSuccess?.()
        onClose()
      },
      onError: (err) =>
        console.error("Failed to edit annotation", err),
    })
  }

  return (
    <div className="flex flex-column gap--small padding--medium">
      <h3>Edit Annotation</h3>

      <AnnotationGroupInput
        selectedItem={annotation.group_tag}
        disabled={true}
      />

      <input
        className="text-input"
        placeholder="Annotation title"
        value={annotation.text}
        onChange={(e) =>
          setAnnotation((prev) => ({ ...prev, text: e.target.value }))
        }
      />

      <input
        className="text-input"
        placeholder="Description"
        value={annotation.description}
        onChange={(e) =>
          setAnnotation((prev) => ({ ...prev, description: e.target.value }))
        }
      />

      <input
        className="text-input"
        placeholder="Source (e.g. UniProt, MitoCarta, Manual)"
        value={annotation.source}
        onChange={(e) =>
          setAnnotation(prev => ({ ...prev, source: e.target.value }))
        }
      />

      <input
        className="text-input"
        placeholder="Publication (optional)"
        value={annotation.publication}
        onChange={(e) =>
          setAnnotation((prev) => ({ ...prev, publication: e.target.value }))
        }
      />

      <input
        className="text-input"
        placeholder="PubMed ID (optional)"
        value={annotation.pubmed_id}
        onChange={(e) =>
          setAnnotation((prev) => ({ ...prev, pubmed_id: e.target.value }))
        }
      />

      <div className="flex gap--small" style={{ alignItems: "flex-start" }}>
        <textarea
          className="text-input"
          placeholder="Protein tags (newline or ; separated)"
          value={annotation.protein_tags.join("\n")}
          onChange={(e) =>
            setAnnotation((prev) => ({
              ...prev,
              protein_tags: e.target.value.split("\n"),
            }))
          }
          style={{
            flex: 1,
            minHeight: "100px",
            maxHeight: "200px",
            resize: "vertical",
            overflowY: "auto",
          }}
        />
        <AnnotationUpload onProteinIdsLoaded={handleProteinIdsLoaded} />
      </div>

      {isError && (
        <div style={{ color: "red" }}>
          {error?.message ?? "Failed to update annotation"}
        </div>
      )}

      <div className="flex justify-end gap--small">
        <button className="dialog-button" 
        style={{ backgroundColor: "#ec7160ff" }}
        onClick={onClose}>
          Close
        </button>

        <button
          className="dialog-button"
          disabled={isLoading || !annotation.text.trim()}
          onClick={editAnnotation}
        >
          {isLoading ? "Editing…" : "Edit"}
        </button>
      </div>
    </div>
  )
}


export function EditAnnotationDialog({ isOpen, onClose, tag, onSuccess }) {
  return (
    <Dialog
      isOpen={isOpen}
      title="Edit Annotation"
      onClose={onClose}
      style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }}
      canOutsideClickClose={false}
    >
      <div
        className="padding--medium"
        style={{ height: "100%", overflowY: "auto" }}
      >
        <EditAnnotations
          isOpen={isOpen}
          tag={tag}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </Dialog>
  )
}

