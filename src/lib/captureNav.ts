const RETURN_KEY = "btgo-capture-return";

/** Remember where to return when the user cancels capture. */
export function rememberCaptureReturn(path: string) {
  if (typeof sessionStorage === "undefined") return;
  if (!path.startsWith("/") || path.startsWith("//") || path === "/capture") return;
  sessionStorage.setItem(RETURN_KEY, path);
}

/** Read and clear the stored return path. */
export function consumeCaptureReturn(fallback = "/"): string {
  if (typeof sessionStorage === "undefined") return fallback;
  const path = sessionStorage.getItem(RETURN_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  if (path && path.startsWith("/") && !path.startsWith("//") && path !== "/capture") return path;
  return fallback;
}
