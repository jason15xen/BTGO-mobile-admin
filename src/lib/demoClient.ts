"use client";

/**
 * Client-authoritative demo progress.
 *
 * The entire scripted demo derives from a single number — `captureStep` (how
 * many photos have been taken). We keep it in localStorage so it survives
 * client-side navigation between pages, and clear it on every full page load
 * (see `ensureDemoSessionReady` in gameApi) so an F5/reload restarts the demo.
 *
 * Because the client sends this value to the server on every request, the
 * server never has to remember progress in its own memory — which is what made
 * the step jump around (and the nine entities reappear) on multi-instance /
 * serverless deployments.
 */
const STEP_KEY = "btgo-demo-step";

export function getDemoStep(): number {
  if (typeof localStorage === "undefined") return 0;
  const raw = localStorage.getItem(STEP_KEY);
  const n = raw == null ? 0 : Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function setDemoStep(step: number): void {
  if (typeof localStorage === "undefined") return;
  const n = Number.isFinite(step) && step >= 0 ? Math.floor(step) : 0;
  localStorage.setItem(STEP_KEY, String(n));
}

export function clearDemoStep(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(STEP_KEY);
}
