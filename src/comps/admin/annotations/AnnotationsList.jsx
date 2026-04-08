import { useState } from "react"
import _ from "lodash"
import hooks from "@mitocube/api-hooks"
import { EditAnnotationDialog } from "./EditAnnotationDialog"
import { DeleteAnnotationsDialog } from "./DeleteAnnotationsDialog"
import { AddAnnotationDialog } from "./AddAnnotationsDialog"
import { OptionButton } from "../../core/base/buttons/OptionButton"

export function AnnotationItem({ tag, showDetails = false, updateAnnotationList }) {

  const [isOpen, setIsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [update, setUpdate] = useState(undefined)

  const { data: permissions, isSuccess } =
    hooks.annotationspermissions.useGetAnnotationPermissions();

  const canShowRemoveButton = isSuccess && permissions.delete

  const { data: annotation, isSuccess: isAnnotationSuccess, refetch: refetchAnnotations} =
    hooks.annotations.useGetAnnotationsByTag(
      { tag },
      { enabled: _.isString(tag) }
    )

  const { data: proteinCount } =
    hooks.annotations.useGetAnnotationProteinCount(
      { tag },
      { enabled: _.isString(tag) }
    )

  const { mutate: deleteAnnotation } =
    hooks.annotations.useDeleteAnnotations({
      onSuccess: () => {
        setIsDeleteOpen(true)
      },
    })

  const handleRemove = (e) => {
    e.stopPropagation()
    deleteAnnotation({ tag })
  }

  const handleEditClose = () => {
    setUpdate(Date.now())
    setIsOpen(false)
    updateAnnotationList()
  }

  const handleDeleteDialogClose = () => {
    setIsDeleteOpen(false)
    updateAnnotationList()
  }

  if (!isAnnotationSuccess) return null

  return (
    <div className="flex flex-column padding--medium" style={{ width: "100%" }}>

      <EditAnnotationDialog
        isOpen={isOpen}
        onClose={handleEditClose}
        tag={tag}
        onSuccess={refetchAnnotations}
      />

      <DeleteAnnotationsDialog
        isOpen={isDeleteOpen}
        onClose={handleDeleteDialogClose}
        tag={tag}
        onSuccess={refetchAnnotations}
      />

      <div
        className="flex justify-space-between align-center"
        style={{ width: "100%" }}
      >
        <div>
          <strong>{annotation.text}</strong>

          {annotation.description && (
            <div style={{ fontSize: "0.75rem", color: "#666" }}>
              {annotation.description}
            </div>
          )}

          <div style={{ fontSize: "0.75rem", color: "#666" }}>
            {proteinCount ?? 0} proteins
          </div>
        </div>

        <div className="flex gap--small align-center" style={{ gap: "0.4rem" }}>
          <button
            onClick={() => setIsOpen(true)}
            className="basic-button"
          >
            Edit
          </button>

          {canShowRemoveButton && (
            <button
              onClick={handleRemove}
              className="basic-button"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {showDetails ? (
        <table
          style={{
            width: "fit-content",
            fontSize: "0.75rem",
            textAlign: "left",
            marginTop: "0.25rem",
          }}
        >
          <tbody>
            <tr>
              <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>
                Publication
              </th>
              <td>{annotation.publication || "-"}</td>
            </tr>

            <tr>
              <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>
                PubMed ID
              </th>
              <td>{annotation.pubmed_id || "-"}</td>
            </tr>

            <tr>
              <th style={{ paddingRight: "0.5rem", fontWeight: 600 }}>
                Group
              </th>
              <td>{annotation.group_tag}</td>
            </tr>
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

const LIMIT_OPTIONS = [20, 50, 100, 200, 500, 1000]

export function AnnotationsList({ tag }) {
    const [isOpen, setIsOpen] = useState(false)
    const [limit, setLimit] = useState(20)

    const {
        data: annotationTags = [],
        isLoading,
        isError,
        error,
        refetch: refetchAnnotations,
    } = hooks.annotations.useGetAnnotationsByGroupTag(
        { tag, limit },
        { enabled: _.isString(tag) }
    )

    const { data: totalCount } = hooks.annotations.useGetAnnotationGroupCount(
        { tag },
        { enabled: _.isString(tag) }
    )

    return (
        <div className="right-panel">

            <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h4 style={{ margin: 0 }}>Annotations {totalCount != null ? `(${totalCount})` : ""}</h4>
                <button className="basic-button" onClick={() => setIsOpen(true)}>+ Add Annotation</button>
            </div>

            <div className="flex" style={{ marginBottom: "0.75rem" }}>
                {LIMIT_OPTIONS.map(option => (
                    <OptionButton key={option} onClick={() => setLimit(option)} isSelected={option === limit}>
                        {option}
                    </OptionButton>
                ))}
            </div>

            <div className="annotation-list">
                {isLoading && <div>Loading annotations…</div>}
                {isError && <div style={{ color: "red" }}>{error?.message ?? "Failed to load annotations"}</div>}
                {!isLoading && !annotationTags.length && <div className="muted">No annotations found.</div>}
                {annotationTags.map(t => (
                    <AnnotationItem key={t} tag={t} updateAnnotationList={refetchAnnotations} />
                ))}
            </div>

            <AddAnnotationDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                group_tag={tag}
                onSuccess={refetchAnnotations}
            />
        </div>
    )
}