import { useState } from "react"
import { AnnotationGroupSearch } from "./AnnotationGroupSearch"
import { AnnotationsList } from "./AnnotationsList"

export function AnnotationsPage() {
  const [selectedGroup, setSelectedGroup] = useState(null)
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          width: 320,
          minWidth: 320,
          borderRight: "1px solid #e5e7eb",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <AnnotationGroupSearch
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />
      </div>
      <div
        style={{
          flex: 1,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <AnnotationsList tag={selectedGroup} />
      </div>
    </div>
  )
}