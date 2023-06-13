
import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import _ from "lodash"
export const useAnimatedCounter = (
    maxValue = 400,
    initialValue = 0,
    duration = 1,
    round = true,
    roundPrecision = 0
) => {
  const [counter, setCounter] = useState(initialValue);

    useEffect(() => {
      const controls = animate(initialValue, maxValue, {
          duration,
          ease : "easeOut",
        onUpdate(value) {
            setCounter(value);
        }
      });
        
    return () => controls.stop();
  }, [initialValue, maxValue, duration]);

  return round ? _.round(counter,roundPrecision) : counter ;
}