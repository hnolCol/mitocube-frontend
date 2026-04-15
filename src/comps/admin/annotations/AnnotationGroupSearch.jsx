import { useEffect, useState } from "react";
import { api } from "@/api";
import useDebounce from "../../../hooks/useDebounce";
import { AnnotationGroupContainer } from "./AnnotationGroupContainer";
import { AddAnnotationGroupDialog } from "./AddAnnotationGroupDialog";

export function AnnotationGroupSearch({ selectedGroup, onSelectGroup }) {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);
  const [groups, setGroups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data, isSuccess, refetch } =
    api.annotations.queryAnnotations.useGetAnnotationGroupByQuery(
      { search_string: debounced },
      { staleTime: 2000 }
    );

  useEffect(() => {
    if (isSuccess && Array.isArray(data)) {
      setGroups(data);
    }
  }, [isSuccess, data]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexShrink: 0,
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>Annotation Groups</h3>
        </div>
        <div>
          <button className="basic-button" onClick={() => setIsOpen(true)}>
            + Add Group
          </button>
        </div>
      </div>
  
      <input
        className="search-input"
        placeholder="Search annotation groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "1rem", flexShrink: 0 }}
      />
  
      <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: 6,
        paddingBottom: 30,
      }}
    >
        <AnnotationGroupContainer
          tags={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={onSelectGroup}
        />
      </div>
  
      <AddAnnotationGroupDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}