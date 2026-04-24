import { api } from "@/api"
import { useState } from "react"
import { Dialog, H3 } from "@blueprintjs/core"
import { AnnotationGroupInput } from "./AnnotationGroupInput"
import { useEffect } from "react"
import _ from "lodash"
import { AnnotationUpload } from "./AnnotationFileUpload"

const INITIAL_ANNOTATION = {
  text: "",
  description: "",
  publication: "",
  pubmed_id: "",
  source: "",
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
  } = api.annotations.modifyAnnotations.usePostAnnotations({
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

  const handleProteinIdsLoaded = (ids) => {
    setAnnotation((prev) => ({
      ...prev,
      protein_tags: Array.from(
        new Set([...prev.protein_tags, ...ids])
      ),
    }));
  };
  const insertAnnotation = () => {
          const data = {
              text: annotation.text,
              description: annotation.description,
              publication: annotation.publication,
              pubmed_id: annotation.pubmed_id,
              source: annotation.source,
              protein_tags: annotation.protein_tags.flatMap(t => t.split(";")).map(t => t.trim()).filter(Boolean),
              group_tag: annotation.group_tag,
          };


  
          postAnnotation(data, {
              onSuccess: (tag) => {
                  setAnnotation(INITIAL_ANNOTATION);
  
                  if (_.isFunction(onSuccess)) {
                    onSuccess();                  
                  }
  
                  onClose();
              },
              onError: (err) => {
                  console.error("Failed to insert annotation", err);
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
{/*    
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          Upload File
      </h3>
      <p>
          Upload a file containing protein identifiers (e.g. UniProt accessions).
          Supported formats: TSV, CSV, TXT.
      </p>
      <AnnotationUpload
        onProteinIdsLoaded={handleProteinIdsLoaded}
          /> */}




      {isError && (
        <div style={{ color: "red" }}>
          {error?.message ?? "Failed to insert annotation"}
        </div>
      )}

      <div className="flex justify-end gap--small">
        <button 
              className="dialog-button" 
              style={{ backgroundColor: "#ec7160ff" }}
              onClick={onClose}>
          Close
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

export function AddAnnotationDialog({ isOpen, onClose, group_tag, onSuccess }) {
  return (
    <Dialog
      isOpen={isOpen}
      title="Add Annotation"
      onClose={onClose}
      style={{ width: "min(600px,85vw)", height: "min(70vh, 900px)" }}
      canOutsideClickClose={false}
    >

        <div
          className="padding--medium"
          style={{
            height: "100%",
            overflowY: "auto",
          }}
        >

        <InsertAnnotations
          isOpen={isOpen}
          onClose={onClose}
          group_tag={group_tag}
          onSuccess={onSuccess}
        />

      </div>
    </Dialog>
  )
}

