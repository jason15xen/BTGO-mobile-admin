/** True when the page was loaded via browser refresh (F5 / reload). */
export function isPageReload(): boolean {
  if (typeof performance === "undefined") return false;
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === "reload";
}
