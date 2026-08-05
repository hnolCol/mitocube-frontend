import { useState, useEffect } from "react";
import { AnimatePresence, Reorder } from "framer-motion";
import { ConditionApplicationsView } from "@/comps/core/base/condition_applications/ConditionApplicationView";
import _ from "lodash";

// --- Softer, muted diverging gradient: blue -> slate -> red ---
// (no blown-out neon white in the middle)
const COLOR_STOPS = [
  { r: 59, g: 130, b: 246 },   // blue-500
  { r: 226, g: 232, b: 240 },  // slate-200 (soft midpoint, not pure white)
  { r: 239, g: 68, b: 68 },    // red-500
];

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

const getGradientColor = (value, min, max) => {
  const t = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  const scaled = t * (COLOR_STOPS.length - 1);
  const i = Math.min(COLOR_STOPS.length - 2, Math.floor(scaled));
  const localT = scaled - i;
  const c1 = COLOR_STOPS[i];
  const c2 = COLOR_STOPS[i + 1];
  return `rgb(${lerp(c1.r, c2.r, localT)}, ${lerp(c1.g, c2.g, localT)}, ${lerp(c1.b, c2.b, localT)})`;
};

// Build a stable identity for an item that doesn't depend on its position.
// If your items can have an explicit id, prefer that over joining tags.
const getItemKey = (item) => (item?.id ?? _.join(item, "-"));

export default function Trendlist({ items = [], onChange, orientation = "horizontal" }) {
  // const [list, setList] = useState(items);

  // useEffect(() => {
  //   setList(items);
  // }, [items]);

  const isVertical = orientation === "vertical";

  return (
    <div
      className="div--expand"
      style={{
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        gap: "1rem",
        overflowX: isVertical ? "hidden" : "auto",
        overflowY: isVertical ? "auto" : "hidden",
        backgroundColor : "#efefef"
      }}
    >
      <Reorder.Group
        axis={isVertical ? "y" : "x"}
        values={items}
        onReorder={onChange}
        style={{
          width : "100%",
          flexShrink: 0,
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          gap: "1rem",
          overflowX: isVertical ? "hidden" : "auto",
          overflowY: isVertical ? "auto" : "hidden",
        }}
        className={`${isVertical ? "flex center-items" : "flex"}`}
      >
        <AnimatePresence>
          {items.map((item, idx) => (
            <Reorder.Item
              style={{listStyle : "none"}}
              key={getItemKey(item)}
              value={item}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileDrag={{ scale: 1.05, zIndex: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              className="cursor-grab active:cursor-grabbing"
            >
              <div
                className="flex"
                style={{
                  flexDirection: isVertical ? "column" : "row",
                  gap: "0.5rem",
                  alignItems: isVertical ? "flex-start" : "center",
                }}
              >
                <button
                  className="basic-button--small"
                  style={{
                    backgroundColor: getGradientColor(idx, 0, Math.max(items.length - 1, 1)),
                    color: "#fff",
                    borderRadius: "0.25rem",
                    minWidth: "8rem",
                    transition: "background-color 0.4s ease",
                  }}
                >
                  {item.map((tag) => (
                    <ConditionApplicationsView key={tag} tag={tag} />
                  ))}
                </button>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
