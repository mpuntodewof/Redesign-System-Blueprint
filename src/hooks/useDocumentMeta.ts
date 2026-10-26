import { useEffect } from "react";
import { defaultMeta, type PageMeta } from "@/lib/pageMeta";

function apply({ title, description }: PageMeta) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
}

/** Keeps the tab title and description in step with client-side navigation. */
export function useDocumentMeta(meta: PageMeta | null) {
  const title = meta?.title;
  const description = meta?.description;
  useEffect(() => {
    apply(meta ?? defaultMeta);
    return () => apply(defaultMeta);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- title/description identify the meta
  }, [title, description]);
}
