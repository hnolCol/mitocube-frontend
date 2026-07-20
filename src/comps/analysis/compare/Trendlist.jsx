import { useState, useEffect } from "react";
import { AnimatePresence, Reorder } from "framer-motion";
import { ConditionApplicationsView } from "@/comps/core/base/condition_applications/ConditionApplicationView";
import _ from "lodash";
import viz from "@mitocube/viz";

const getGradientColor = (value, min, max) => {
  const normalized = (value - min) / (max - min);
  if (normalized < 0.5) {
    const t = normalized * 2;
    const r = Math.round(0 + (255 - 0) * t);
    const g = Math.round(255 * (1 - t));
    const b = Math.round(255);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (normalized - 0.5) * 2;
    const r = Math.round(255);
    const g = Math.round(255 * (1 - t));
    const b = Math.round(255 * (1 - t));
    return `rgb(${r}, ${g}, ${b})`;
  }
};





export default function Trendlist({ items = [], orientation = "vertical" }) {

console.log(items)

  const [list, setList] = useState(items);

  useEffect(() => {
    setList(items);
  }, [items]);

  const isVertical = orientation === "vertical";

  return (
    <div className="div--expand" style={{ display: "flex", flexDirection: isVertical ? "column" : "row", gap: "1rem", overflowX: isVertical ? "hidden" : "auto", overflowY: isVertical ? "auto" : "hidden" }}>
      <Reorder.Group
        axis={isVertical ? "y" : "x"}
        values={list}
              onReorder={setList}
              style={{shrink : 0, display : "flex", flexDirection : isVertical ? "column" : "row", gap : "1rem", overflowX : isVertical ? "hidden" : "auto", overflowY : isVertical ? "auto" : "hidden"}}
        className={`${isVertical ? "flex center-items" : "flex"}`}
      >
        <AnimatePresence>
          {list.map((item, idx) => (
            <Reorder.Item
              key={_.join(item, "-") + "-" + idx}
              value={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileDrag={{ scale: 1.05 }}
              className="cursor-grab active:cursor-grabbing"
              >
                  {console.log(item,"BUM")}
                  <div className="flex" style={{ flexDirection: isVertical ? "column" : "row", gap: "0.5rem", alignItems: isVertical ? "flex-start" : "center" }}>
                      <button className="basic-button--small" style={{ backgroundColor: getGradientColor(idx, 0, items.length), color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.25rem", minWidth : "8rem" }}>
                          {item.map(tag => <ConditionApplicationsView key={tag} tag={tag} />)}
                          </button>
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}


