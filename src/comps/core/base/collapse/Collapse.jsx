export default function PersistentCollapseDemo() {
  return <Example />;
}

import { useEffect, useRef, useState } from "react";
import { motion  } from "framer-motion";

export function PersistentCollapse({
  isOpen,
  children,
  duration = 0.35,
  direction = "vertical",
  keepMounted = true,
  className = "",
  horizontalWidth = "max-content"
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState(isOpen ? "auto" : 0);

    const dimension = direction === "horizontal" ? "width" : "height";
  const scrollSizeKey =
    direction === "horizontal" ? "scrollWidth" : "scrollHeight";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isOpen) {
        setSize(el[scrollSizeKey]);
      }
    });

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [isOpen, scrollSizeKey]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isOpen) {
      setSize(el[scrollSizeKey]);

      const timeout = setTimeout(() => {
        setSize("auto");
      }, duration * 1000);

      return () => clearTimeout(timeout);
    }

    if (size === "auto") {
      setSize(el[scrollSizeKey]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSize(0);
        });
      });
    } else {
      setSize(0);
    }
  }, [isOpen]);

  const animate = {
    opacity: isOpen ? 1 : 0.96,
      [dimension]: size,
    
  };

  const content = keepMounted || isOpen ? children : null;

  return (
    <motion.div
      animate={animate}
      transition={{
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
          overflow: "hidden",
          height : "90vh"
      }}
      className={className}
    >
      <div
        ref={containerRef}
        style={{
            width: direction === "horizontal" ? horizontalWidth : "100%",
            
        }}
      >
        {content}
      </div>
    </motion.div>
  );
}

// function Example() {
//   const [open, setOpen] = useState(true);

//   return (
//     <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
//       <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
//         <button
//           onClick={() => setOpen((v) => !v)}
//           className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
//         >
//           <div>
//             <h2 className="text-lg font-semibold tracking-tight">
//               Persistent Collapse
//             </h2>
//             <p className="text-sm text-neutral-400 mt-1">
//               Children stay mounted while closed.
//             </p>
//           </div>

//           <motion.div
//             animate={{ rotate: open ? 180 : 0 }}
//             transition={{ duration: 0.25 }}
//           >
//             <ChevronDown className="w-5 h-5 text-neutral-300" />
//           </motion.div>
//         </button>

//         <PersistentCollapse
//           isOpen={open}
//           duration={0.45}
//           direction="vertical"
//         >
//           <div className="px-6 pb-6">
//             <div className="rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
//               <div>
//                 <h3 className="font-medium text-neutral-100">
//                   Mounted State Preserved
//                 </h3>
//                 <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
//                   Unlike conditional rendering patterns, this component keeps
//                   children mounted even while collapsed. Useful for preserving
//                   form state, media playback, canvas contexts, and expensive
//                   React trees.
//                 </p>
//               </div>

//               <LiveCounter />
//             </div>
//           </div>
//         </PersistentCollapse>
//       </div>
//     </div>
//   );
// }

// function LiveCounter() {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCount((c) => c + 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div
//         key={count}
//         initial={{ opacity: 0, y: 6 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -6 }}
//         transition={{ duration: 0.2 }}
//         className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
//       >
//         <span className="text-sm text-neutral-400">
//           Counter keeps running while collapsed
//         </span>

//         <span className="font-mono text-lg font-semibold text-white">
//           {count}
//         </span>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
