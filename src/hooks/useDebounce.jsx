import { useEffect, useState } from "react";

function useDebounce(value = "", delay = 3000) {
// debounce hook. The value will be changed only in a certain interval (ms)
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;