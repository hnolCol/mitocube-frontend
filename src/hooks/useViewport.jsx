import { useEffect, useState } from "react";

/**
 * @description Tracks the browser viewport size and updates on resize.
 * @returns {{ width: number, height: number }} Current viewport dimensions in px.
 */
export function useViewport() {
    const [viewport, setViewport] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setViewport({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return viewport;
}

/**
 * @description True when the viewport width is below the given threshold (default 1024px,
 * i.e. smaller than a typical iPad in landscape orientation). Uses matchMedia so it also
 * reacts to orientation changes.
 * @param {number} [threshold=1024] Width threshold in px.
 * @returns {boolean} True if the screen is considered too small for complex visualizations.
 */
export function useIsSmallScreen(threshold = 1024) {
    const query = `(max-width: ${threshold}px)`;
    const [isSmall, setIsSmall] = useState(
        typeof window !== "undefined" && typeof window.matchMedia === "function"
            ? window.matchMedia(query).matches
            : window.innerWidth < threshold
    );

    useEffect(() => {
        if (typeof window.matchMedia !== "function") return undefined;
        const mql = window.matchMedia(query);
        const onChange = (event) => setIsSmall(event.matches);
        setIsSmall(mql.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return isSmall;
}
