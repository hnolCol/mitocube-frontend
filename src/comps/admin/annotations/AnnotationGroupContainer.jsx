import { AnnotationGroupItem } from "./AnnotationGroupItem"

export function AnnotationGroupContainer({ tags, selectedGroup, onSelectGroup  }) {
  return (
    <div className="flex flex-column">
      {tags.map(tag => (
        <AnnotationGroupItem
          key={tag}
          tag={tag}
          isSelected={selectedGroup === tag}
          onClick={() => onSelectGroup(tag)}
        />
      ))}
    </div>
  );
}
