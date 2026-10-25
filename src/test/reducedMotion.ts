/**
 * Replaces window.matchMedia so `(prefers-reduced-motion: reduce)` matches or not.
 * Call mockReducedMotion(false) in afterEach to restore the setup.ts default.
 */
export function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
