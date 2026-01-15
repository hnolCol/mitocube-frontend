import { useEffect, useState } from "react";
import hooks from "@mitocube/api-hooks";
import useDebounce from "../../../hooks/useDebounce";
import { AnnotationGroupContainer } from "./AnnotationGroupContainer";
import { AddAnnotationGroupDialog } from "./AddAnnotationGroupDialog";

export function AnnotationGroupSearch({ selectedGroup, onSelectGroup }) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [groups, setGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isSuccess, refetch } =
    hooks.annotations.useGetAnnotationGroupByQuery(
      { search_string: debounced },
      { staleTime: 2000 }
    );

  useEffect(() => {
    if (isSuccess && Array.isArray(data)) {
      setGroups(data);
    }
  }, [isSuccess, data]);

  return (
    <div className="left-panel">
      <div className="flex justify-space-between align-center">
        <h4>Annotation Groups</h4>
        <button className="basic-button" onClick={() => setIsOpen(true)}>
          + Add Group
        </button>
      </div>

      <input
        className="search-input"
        placeholder="Search annotation groups…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <AnnotationGroupContainer
        tags={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelectGroup}
      />

      <AddAnnotationGroupDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
