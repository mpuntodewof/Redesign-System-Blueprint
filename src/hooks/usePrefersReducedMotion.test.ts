import { renderHook } from "@testing-library/react";
import { mockReducedMotion } from "@/test/reducedMotion";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

describe("usePrefersReducedMotion", () => {
  afterEach(() => mockReducedMotion(false));

  it("is false when the user has not asked for reduced motion", () => {
    mockReducedMotion(false);
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(false);
  });

  it("is true when the OS asks for reduced motion", () => {
    mockReducedMotion(true);
    expect(renderHook(() => usePrefersReducedMotion()).result.current).toBe(true);
  });
});
