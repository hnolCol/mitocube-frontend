import React from "react";

const COLORS = {
  trend: "#3b82f6",
  pairwise: "#10b981",    
  annotation : "#f97316",
  and: "#8b5cf6",
  or: "#f59e0b",
  not: "#ef4444",
};

const ICONS = {
  trend: "📈",
  pairwise: "🧬",
  and: "🔗",
  or: "🔀",
  not: "🚫",
};

export default function StepCounts({ steps }) {
  if (!steps || steps.length === 0) {
    return null;
  }

  const max = Math.max(...steps.map((s) => s.count));

  return (
    <div style={styles.wrapper}>
      {steps.map((step, index) => {
        const width = `${(step.count / max) * 100}%`;

        return (
          <React.Fragment key={step.id ?? index}>
            <div
              style={{
                ...styles.card,
                borderLeft: `6px solid ${COLORS[step.type] || "#999"}`,
              }}
            >
              <div style={styles.header}>
                <span style={styles.icon}>{ICONS[step.type]}</span>

                <div style={{ flex: 1 }}>
                  <div style={styles.title}>
                    {step.type.toUpperCase()}
                  </div>

                  {step.description && (
                    <div style={styles.description}>
                      {step.description}
                    </div>
                  )}
                </div>

                <div style={styles.count}>
                  {step.count.toLocaleString()}
                </div>
              </div>

              <div style={styles.barBackground}>
                <div
                  style={{
                    ...styles.bar,
                    width,
                    background: COLORS[step.type],
                  }}
                />
              </div>
            </div>

            {index !== steps.length - 1 && (
              <div style={styles.arrow}>↓</div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: 700,
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    background: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
    boxShadow: "0 3px 10px rgba(0,0,0,.08)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  icon: {
    fontSize: 26,
  },

  title: {
    fontWeight: 700,
    fontSize: 15,
  },

  description: {
    color: "#666",
    marginTop: 4,
    fontSize: 13,
  },

  count: {
    fontSize: 24,
    fontWeight: 700,
  },

  barBackground: {
    marginTop: 12,
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

  arrow: {
    textAlign: "center",
    fontSize: 24,
    color: "#999",
    margin: "4px 0",
  },
};