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
      }}
    >
 
      <div
        style={{
          width: 320,
          minWidth: 320,
          borderRight: "1px solid #e5e7eb",
          padding: 12,
          overflowY: "auto",
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
          overflowY: "auto",
        }}
      >
          <AnnotationsList tag={selectedGroup} />

      </div>
    </div>
  )
}
