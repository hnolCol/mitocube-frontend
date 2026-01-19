import hooks from "@mitocube/api-hooks"
import { useState } from "react"
import { Dialog } from "@blueprintjs/core"
import { AnnotationGroupInput } from "./AnnotationGroupInput"
import { useEffect } from "react"
import _ from "lodash"

const INITIAL_ANNOTATION = {
  text: "",
  description: "",
  publication: "",
  pubmed_id: "",
  protein_tags: [],
  group_tag: "",
}

export function InsertAnnotations({ isOpen, onClose, onSuccess, group_tag }) {
  const [annotation, setAnnotation] = useState(INITIAL_ANNOTATION)

  const {
    mutate: postAnnotation,
    isLoading,
    isError,
    error,
  } = hooks.annotations.usePostAnnotations({
    onSuccess: () => {
      setAnnotation(INITIAL_ANNOTATION)
      onClose()
    },
  })

  
    useEffect(() => {
        if (group_tag) {
            setAnnotation(prev => ({
            ...prev,
            group_tag,
            }))
        }
        }, [group_tag])

        if (!isOpen) return null


  const insertAnnotation = () => {
          const data = {
              text: annotation.text,
              description: annotation.description,
              publication: annotation.publication,
              pubmed_id: annotation.pubmed_id,
              protein_tags: annotation.protein_tags,
              group_tag: annotation.group_tag,
          };


  
          postAnnotation(data, {
              onSuccess: (tag) => {
                  setAnnotation(INITIAL_ANNOTATION);
  
                  if (_.isFunction(onSuccess)) {
                      onSuccess(tag);
                  }
  
                  onClose();
              },
              onError: (err) => {
                  console.error("Failed to insert annotation", err);
                  console.log(annotation);
              },
          });
      };

  return (
    <div className="flex flex-column gap--small padding--medium">
      <h3>Add Annotation</h3>

      <AnnotationGroupInput
        selectedItem={annotation.group_tag}
        disabled={!!group_tag}
        onItemSelect={(group_tag) =>
            setAnnotation(prev => ({ ...prev, group_tag }))
        }
        />


      <input
        className="text-input"
        placeholder="Annotation title"
        value={annotation.text}
        onChange={e =>
          setAnnotation(prev => ({ ...prev, text: e.target.value }))
        }
      />

      <input
        className="text-input"
        placeholder="Description"
        value={annotation.description}
        onChange={e =>
          setAnnotation(prev => ({ ...prev, description: e.target.value }))
        }
      />

      <input
        className="text-input"
        placeholder="Publication (optional)"
        value={annotation.publication}
        onChange={e =>
          setAnnotation(prev => ({ ...prev, publication: e.target.value }))
        }
      />

      <input
        className="text-input"
        placeholder="PubMed ID (optional)"
        value={annotation.pubmed_id}
        onChange={e =>
          setAnnotation(prev => ({ ...prev, pubmed_id: e.target.value }))
        }
      />

<textarea
  className="text-input"
  placeholder="Protein tags (newline or ; separated)"
  defaultValue={annotation.protein_tags.join("\n")}
  onBlur={e =>
    setAnnotation(prev => ({
      ...prev,
      protein_tags: e.target.value
        .split(/[\n;]+/)
        .map(tag => tag.trim())
        .filter(Boolean),
    }))
  }
/>




      {isError && (
        <div style={{ color: "red" }}>
          {error?.message ?? "Failed to insert annotation"}
        </div>
      )}

      <div className="flex justify-end gap--small">
        <button className="dialog-button" onClick={onClose}>
          Cancel
        </button>

        <button
          className="dialog-button"
          disabled={
            isLoading ||
            !annotation.text.trim() ||
            !annotation.group_tag
          }
          onClick={insertAnnotation}
        >
          {isLoading ? "Inserting…" : "Insert"}
        </button>
      </div>
    </div>
  )
}

export function AddAnnotationDialog({ isOpen, onClose, group_tag }) {
  return (
    <Dialog
      isOpen={isOpen}
      title="Add Annotation"
      onClose={onClose}
      style={{ width: "min(600px,85vw)", height: "min(90vh, 900px)" }}
      canOutsideClickClose={false}
    >
      <div className="padding--medium" style={{ height: "95%" }}>
        <InsertAnnotations
          isOpen={isOpen}
          onClose={onClose}
          group_tag={group_tag}
        />
      </div>
    </Dialog>
  )
}

