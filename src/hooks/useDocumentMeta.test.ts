import { renderHook } from "@testing-library/react";
import { defaultMeta } from "@/lib/pageMeta";
import { useDocumentMeta } from "./useDocumentMeta";

describe("useDocumentMeta", () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="description" content="start" />';
    document.title = "start";
  });

  it("applies a page's title and description and restores the defaults on unmount", () => {
    const { unmount } = renderHook(() => useDocumentMeta({ title: "Case", description: "Desc", url: "https://x/p" }));
    expect(document.title).toBe("Case");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("Desc");
    unmount();
    expect(document.title).toBe(defaultMeta.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(defaultMeta.description);
  });

  it("uses the defaults when the page has no meta", () => {
    renderHook(() => useDocumentMeta(null));
    expect(document.title).toBe(defaultMeta.title);
  });
});
