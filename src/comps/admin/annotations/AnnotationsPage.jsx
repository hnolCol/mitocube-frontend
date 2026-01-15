import { useState } from "react"
import { AnnotationGroupSearch } from "./AnnotationGroupSearch"
import { AnnotationsList } from "./AnnotationsList"

export function AnnotationsPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div className="page-layout two-column">
      <AnnotationGroupSearch
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
      />
      <AnnotationsList group_tag={selectedGroup} />
    </div>
  );
}
