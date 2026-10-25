import { useEffect, useState } from "react";

interface Timing {
  /** How long a fully typed phrase stays on screen. */
  hold: number;
  /** Delay per erased character. */
  erase: number;
  /** Delay per typed character (also the pause between phrases). */
  type: number;
}

const DEFAULT_TIMING: Timing = { hold: 2600, erase: 28, type: 55 };

/**
 * Cycles through phrases by erasing and retyping them. When disabled it returns
 * the first phrase in full and schedules nothing. `phrases` must be referentially stable.
 */
export function useTypewriter(
  phrases: readonly string[],
  enabled: boolean,
  timing: Timing = DEFAULT_TIMING,
): string {
  const [state, setState] = useState({ index: 0, length: phrases[0]?.length ?? 0, deleting: false });
  const { hold, erase, type } = timing;

  useEffect(() => {
    if (!enabled || phrases.length < 2) return;
    const current = phrases[state.index];
    let delay: number;
    let next: typeof state;

    if (!state.deleting && state.length === current.length) {
      delay = hold;
      next = { ...state, deleting: true };
    } else if (state.deleting && state.length === 0) {
      delay = type;
      next = { index: (state.index + 1) % phrases.length, length: 0, deleting: false };
    } else if (state.deleting) {
      delay = erase;
      next = { ...state, length: state.length - 1 };
    } else {
      delay = type;
      next = { ...state, length: state.length + 1 };
    }

    const id = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(id);
  }, [state, enabled, phrases, hold, erase, type]);

  if (!enabled) return phrases[0] ?? "";
  return phrases[state.index].slice(0, state.length);
}
