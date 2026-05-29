import { AnnotationGroupItem } from "./AnnotationGroupItem"
import PropTypes from "prop-types";


AnnotationGroupContainer.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedGroup: PropTypes.string,
    onSelectGroup: PropTypes.func.isRequired
}
export function AnnotationGroupContainer({ tags, selectedGroup, onSelectGroup  }) {
  return (
    <div className="flex flex-column">
      {tags?.map(tag => (
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
