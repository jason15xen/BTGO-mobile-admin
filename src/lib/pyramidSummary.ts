import type { Ecosystem } from "@/lib/types";

export type PyramidEcoSummary = { found: number; total: number; pct: number };

export function pyramidSummary(
  discovered: string[],
  totalPerEco: number,
): Record<Ecosystem, PyramidEcoSummary> {
  const ecosystems: Ecosystem[] = ["terrestrial", "freshwater", "marine"];
  return Object.fromEntries(
    ecosystems.map((eco) => {
      const prefix = `${eco[0]}-`;
      const found = discovered.filter((id) => id.startsWith(prefix)).length;
      const pct = totalPerEco ? Math.round((found / totalPerEco) * 100) : 0;
      return [eco, { found, total: totalPerEco, pct }];
    }),
  ) as Record<Ecosystem, PyramidEcoSummary>;
}
