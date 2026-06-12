import "server-only";

/** Persist in-memory demo state across Next.js route module instances. */
export function createServerMemory<T>(key: string, init: () => T): () => T {
  return () => {
    const g = globalThis as unknown as Record<string, T | undefined>;
    if (!g[key]) g[key] = init();
    return g[key]!;
  };
}

export function clearServerMemory(key: string) {
  delete (globalThis as unknown as Record<string, unknown>)[key];
}
