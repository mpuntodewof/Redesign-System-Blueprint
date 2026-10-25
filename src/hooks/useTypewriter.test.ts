import { act, renderHook } from "@testing-library/react";
import { useTypewriter } from "./useTypewriter";

const PHRASES = ["ab", "cd"] as const;
const TIMING = { hold: 100, erase: 10, type: 20 };

describe("useTypewriter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows the first phrase in full and never changes when disabled", () => {
    const { result } = renderHook(() => useTypewriter(PHRASES, false, TIMING));
    expect(result.current).toBe("ab");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe("ab");
  });

  it("holds, erases, then types the next phrase when enabled", () => {
    const { result } = renderHook(() => useTypewriter(PHRASES, true, TIMING));
    expect(result.current).toBe("ab");
    act(() => vi.advanceTimersByTime(100)); // hold ends, erasing starts
    expect(result.current).toBe("ab");
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe("");
    act(() => vi.advanceTimersByTime(20)); // switch to the next phrase
    expect(result.current).toBe("");
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toBe("c");
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toBe("cd");
  });
});
