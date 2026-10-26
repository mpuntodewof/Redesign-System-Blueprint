/** Full-page navigation (e.g. to a mailto: link). Separate so tests can mock it. */
export function openUrl(url: string) {
  window.location.href = url;
}
