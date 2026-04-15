function createConditionLabelRenderer(labelMap) {
  return function ConditionLabel({ x, y, tag, textProps }) {
    const text = labelMap[tag] ?? "";
    return (
      <Text x={x} y={y} {...textProps}>
        {text}
      </Text>
    );
  };
}