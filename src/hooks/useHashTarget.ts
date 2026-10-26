import { useEffect, useState } from "react";

/**
 * Returns the id from the URL hash while it should be highlighted (for `durationMs`),
 * but only when it is one of `ids`. Used for shared links like /#work-contract.
 * The highlight starts once the element is mostly on screen, so a long smooth
 * scroll from the top of the page does not use it up before the card is visible.
 */
export function useHashTarget(ids: readonly string[], durationMs = 2400): string | null {
  const [target, setTarget] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const known = key.split("|");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;

    const highlight = (id: string) => {
      setTarget(id);
      clearTimeout(timer);
      timer = setTimeout(() => setTarget(null), durationMs);
    };

    const check = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!known.includes(id)) return;
      observer?.disconnect();
      const el = document.getElementById(id);
      if (!el || typeof IntersectionObserver === "undefined") {
        highlight(id);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          highlight(id);
        },
        { threshold: 0.6 },
      );
      observer.observe(el);
    };

    check();
    window.addEventListener("hashchange", check);
    return () => {
      window.removeEventListener("hashchange", check);
      observer?.disconnect();
      clearTimeout(timer);
    };
  }, [key, durationMs]);

  return target;
}
