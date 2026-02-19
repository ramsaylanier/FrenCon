import { useState, useEffect } from "react";

/**
 * Matches Tailwind's md breakpoint (768px).
 * Returns true when viewport is below md (mobile).
 */
const MOBILE_QUERY = "(max-width: 767px)";

export function useMediaQuery(query: string = MOBILE_QUERY): boolean {
  // Always start with false so server and client initial render match (avoids hydration error).
  // Real value is set in useEffect after mount.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
