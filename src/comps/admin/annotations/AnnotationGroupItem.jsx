import hooks from "@mitocube/api-hooks"
import _ from "lodash"

export function AnnotationGroupItem({ tag, onClick, isSelected }) {
  const { data: group, isSuccess } =
    hooks.annotations.useGetAnnotationGroupByTag(
      { tag },
      { enabled: _.isString(tag) }
    );

  const { data: count } = hooks.annotations.useGetAnnotationGroupCount(
    { tag },
    { enabled: _.isString(tag) }
  )

  if (!isSuccess) return null;

  return (
    <div
      onClick={onClick}
      style={{
        padding: "0.6rem",
        marginBottom: "0.4rem",
        borderRadius: "6px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#e8f0ff" : "#f7f7f7",
        border: isSelected ? "1px solid #3f6ad8" : "1px solid #ddd",
      }}
    >
      <strong>{group.text}</strong>
      <div style={{ fontSize: "0.75rem", color: "#666" }}>
        {group.description}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#444", marginTop: "0.25rem" }}>
        {count ?? 0} annotations
      </div>
    </div>
  );
}
