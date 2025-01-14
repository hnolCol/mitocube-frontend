import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const StackTransitionExample = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stackVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300, // slide in from the side
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
      transition: { duration: 0.5 },
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300, // slide out to the side
      opacity: 0,
      scale: 0.8,
      zIndex: 0,
      transition: { duration: 0.5 },
    }),
  };

  const items = ["Div 1", "Div 2", "Div 3"];

  const nextDiv = () => setCurrentIndex((prev) => (prev + 1) % items.length);
  const prevDiv = () =>
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
      <div>
          <div style={{height:"100px"}}>
      <AnimatePresence custom={1}>
        <motion.div
          key={currentIndex}
          custom={1}
          variants={stackVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#f0f0f0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "10px",
          }}
        >
          {items[currentIndex]}
        </motion.div>
              </AnimatePresence>
              </div>
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
        <button onClick={prevDiv}>Previous</button>
        <button onClick={nextDiv}>Next</button>
      </div>
    </div>
  );
};

export default StackTransitionExample;