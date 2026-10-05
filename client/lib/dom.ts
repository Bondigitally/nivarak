/**
 * Walks up the DOM to find the nearest scrollable ancestor.
 * Falls back to `[data-dashboard-scroll]` — the fixed scroll root set on
 * AppShell's main element — so components inside dialogs and portals can
 * still reach the page scroll container without a direct ref.
 */
export function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current) {
    const { overflowY } = getComputedStyle(current);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return current;
    }
    current = current.parentElement;
  }
  return document.querySelector("[data-dashboard-scroll]");
}
