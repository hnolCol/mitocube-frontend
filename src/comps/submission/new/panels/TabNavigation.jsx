import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";


export function TabNavigation({componentKeys, componentKey, componentNames, setComponentKey  }){
    const [activeIndex, setActiveIndex] = useState(0);
    const [positions, setPositions] = useState([]);
    const buttonRefs = useRef([]);
  
    // Update button positions when the component mounts or window resizes
    useEffect(() => {
      const updatePositions = () => {
        const newPositions = buttonRefs.current.map((ref) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            return { height: rect.height, top: rect.top };
          }
          return { height: 0, top: 0 };
        });
        setPositions(newPositions);
      };
  
      updatePositions();
      window.addEventListener("resize", updatePositions);
      return () => window.removeEventListener("resize", updatePositions);
    }, []);
  
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
            alignItems: "center",
          marginTop: "2rem"
        }}
      >
        {/* Buttons */}
        <div className="flex flex-column" style={{ gap: "10px" }}>
                {componentKeys.map((k, index) => (
                    <button
                        key={index}
                        ref={(el) => (buttonRefs.current[index] = el)}
                        className={`submission-tab-navigation-button div--round margin--tiny ${componentKey.current === k ? "submission-tab-navigation-button--active" : ""}`} 
                            onClick={() => {
                                setActiveIndex(index)
                                setComponentKey(prevValues => {
                                    return {
                                        current: k ,
                                        prev: prevValues.current
                                    }
                                })}}>
                        <div className="div--expand flex justify-end">
                            <div>{componentNames[k]}</div>
                        </div>
                    </button>
          ))}
        </div>
        {/* Animated Color Bar */}
        {positions[activeIndex] && (
                <motion.div
                    className="flex justify-end"
                    initial={false}
                    animate={{
                    height: positions[activeIndex].height || 0,
                    y: positions[activeIndex].top - positions[0]?.top || 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, duration : 1.2 }}
                    style={{
                        position: "absolute",
                        top: "0.1rem",
                        left: "0px", // Align to the center of the buttons
                        width: "100%",
                        marginRight: "1rem",
                        zIndex: 5,
                    }}
                >
                    <div style={{backgroundColor:  "#466688", width : "0.2rem", height : "100%"}}></div>
          </motion.div>
        )}
      </div>
    );
};
  