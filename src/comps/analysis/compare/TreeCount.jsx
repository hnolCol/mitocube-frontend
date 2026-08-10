import React from "react";

const COLORS = {
  trend: "#3b82f6",
  pairwise: "#10b981",
  annotation: "#f97316",
  and: "#8b5cf6",
  or: "#f59e0b",
  not: "#ef4444",
};

const ICONS = {
  trend: "📈",
  pairwise: "🧬",
  annotation: "🏷️",
  and: "🔗",
  or: "🔀",
  not: "🚫",
};

export default function ComparisonTree({ tree }) {
  if (!tree) return null;

  const max = getMax(tree);

  return (
    <div style={styles.wrapper}>
      <TreeNode
        node={tree}
        max={max}
        depth={0}
        isLast
      />
    </div>
  );
}

function TreeNode({ node, max, depth, isLast }) {
  const type = node.type || node.operator;
  const width = `${(node.count / max) * 100}%`;

  return (
    <div style={{ position: "relative" }}>
      {depth > 0 && (
        <>
          {/* vertical */}
          <div
            style={{
              ...styles.vertical,
              height: isLast ? 33 : "120%",
            }}
          />

          {/* horizontal */}
          <div style={styles.horizontal} />
        </>
      )}

      <div
        style={{
          ...styles.nodeContainer,
          marginLeft: depth * 32,
        }}
      >
        <div
          style={{
            ...styles.card,
            borderLeft: `6px solid ${COLORS[type]}`,
          }}
        >
          <div style={styles.header}>
            {/* <div style={styles.icon}>
              {ICONS[type]}
            </div> */}

            <div style={{ flex: 1 }}>
              <div style={styles.title}>
                {type.toUpperCase()}
              </div>

              {node.description && (
                <div style={styles.description}>
                  {node.description}
                </div>
              )}
            </div>

            <div style={styles.count}>
              {node.count}
            </div>
          </div>

          <div style={styles.barBackground}>
            <div
              style={{
                ...styles.bar,
                width,
                background: COLORS[type],
              }}
            />
          </div>
        </div>

        {node.children?.length > 0 && (
          <div style={styles.children}>
            {node.children.map((child, index) => (
              <TreeNode
                key={child.id}
                node={child}
                max={max}
                depth={depth + 1}
                isLast={index === node.children.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getMax(node) {
  let max = node.count;

  node.children?.forEach((c) => {
    max = Math.max(max, getMax(c));
  });

  return max;
}

const styles = {
  wrapper: {
    maxWidth: 900,
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
  },

  nodeContainer: {
    position: "relative",
  },

  children: {
    marginTop: 8,
  },

  vertical: {
    position: "absolute",
    left: 15,
    top: -10,
    width: 2,
    background: "#cfcfcf",
  },

  horizontal: {
    position: "absolute",
    left: 15,
    top: 24,
    width: 20,
    height: 2,
    background: "#cfcfcf",
  },

  card: {
    background: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    boxShadow: "0 3px 12px rgba(0,0,0,.08)",
    transition: "all .2s ease",
    cursor: "default",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  icon: {
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    borderRadius: "50%",
    background: "#f7f7f7",
  },

  title: {
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 1,
  },

  description: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },

  count: {
    fontWeight: 700,
    fontSize: 26,
  },

  barBackground: {
    marginTop: 14,
    height: 8,
    borderRadius: 4,
    background: "#ececec",
    overflow: "hidden",
  },

  bar: {
    height: "100%",
    borderRadius: 4,
    transition: "width .4s ease",
  },
};