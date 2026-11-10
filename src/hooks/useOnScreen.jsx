import { useEffect, useState } from "react"

export function useOnScreen(ref) {

    const [isIntersecting, setIntersecting] = useState(false)

    useEffect(() => {
      const el = ref.current
      if (!el || typeof IntersectionObserver === "undefined") return

      const observer = new IntersectionObserver(
        ([entry]) => setIntersecting(entry.isIntersecting)
      )
      observer.observe(el)
      return () => observer.disconnect()
    }, [ref.current])

    return isIntersecting
}
