import { SPECIES } from "@/data/species";
import type { Ecosystem } from "@/lib/types";
import SpeciesImage from "@/components/SpeciesImage";

const TROPHIC_LABEL: Record<number, string> = {
  4: "高次消費者",
  3: "中次消費者",
  2: "一次消費者",
  1: "生産者",
};

const ROW_WIDTH: Record<number, string> = {
  4: "46%",
  3: "64%",
  2: "82%",
  1: "100%",
};

interface PyramidProps {
  ecosystem: Ecosystem;
  discovered: Set<string>;
  highlightId?: string;
  compact?: boolean;
}

export default function Pyramid({ ecosystem, discovered, highlightId, compact }: PyramidProps) {
  const inEco = SPECIES.filter((s) => s.ecosystem === ecosystem);
  const cellSize = compact ? "w-9 h-9" : "w-12 h-12 sm:w-14 sm:h-14";

  return (
    <div className="flex flex-col items-center gap-2">
      {[4, 3, 2, 1].map((level) => {
        const cells = inEco.filter((s) => s.trophicLevel === level);
        return (
          <div key={level} className="w-full flex flex-col items-center">
            {!compact && (
              <span className="text-[10px] font-medium text-forest-400 mb-1 tracking-wide">
                {TROPHIC_LABEL[level]}
              </span>
            )}
            <div
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-forest-100/70 to-forest-50 ring-1 ring-forest-100 py-2 px-2"
              style={{ width: ROW_WIDTH[level] }}
            >
              {cells.map((s) => {
                const found = discovered.has(s.id);
                const isNew = s.id === highlightId;
                if (found) {
                  return (
                    <div
                      key={s.id}
                      title={s.nameJa}
                      className={`${cellSize} rounded-full overflow-hidden shrink-0 ring-2 transition-all ${
                        isNew ? "ring-gold-400 scale-110 shadow-lg" : "ring-white shadow-sm"
                      }`}
                    >
                      <SpeciesImage
                        speciesId={s.id}
                        emoji={s.emoji}
                        alt={s.nameJa}
                        className="w-full h-full"
                      />
                    </div>
                  );
                }
                return (
                  <div
                    key={s.id}
                    title="未発見"
                    className={`${cellSize} rounded-full shrink-0 bg-forest-200/60 border-2 border-dashed border-forest-300 flex items-center justify-center text-forest-300 text-lg`}
                  >
                    ？
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
