import { useEffect, useState } from "react";

/**
 * Returns the id from the URL hash while it should be highlighted (for `durationMs`),
 * but only when it is one of `ids`. Used for shared links like /#work-contract.
 */
export function useHashTarget(ids: readonly string[], durationMs = 2400): string | null {
  const [target, setTarget] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const known = key.split("|");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!known.includes(id)) return;
      setTarget(id);
      clearTimeout(timer);
      timer = setTimeout(() => setTarget(null), durationMs);
    };
    check();
    window.addEventListener("hashchange", check);
    return () => {
      window.removeEventListener("hashchange", check);
      clearTimeout(timer);
    };
  }, [key, durationMs]);

  return target;
}
