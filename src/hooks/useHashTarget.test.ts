import { act, renderHook } from "@testing-library/react";
import { useHashTarget } from "./useHashTarget";

const IDS = ["work-full-time", "work-contract"] as const;

describe("useHashTarget", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    window.location.hash = "";
  });

  it("targets a known id from the hash, then clears it", () => {
    window.location.hash = "#work-contract";
    const { result } = renderHook(() => useHashTarget(IDS, 1000));
    expect(result.current).toBe("work-contract");
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBeNull();
  });

  it("follows hash changes and ignores unknown ids", () => {
    const { result } = renderHook(() => useHashTarget(IDS, 1000));
    expect(result.current).toBeNull();
    act(() => {
      window.location.hash = "#somewhere";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toBeNull();
    act(() => {
      window.location.hash = "#work-full-time";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toBe("work-full-time");
  });
});
