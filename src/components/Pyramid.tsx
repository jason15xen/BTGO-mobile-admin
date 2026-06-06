import { SPECIES } from "@/data/species";
import type { Ecosystem, Species } from "@/lib/types";
import type { IconType } from "react-icons";
import { GiLion, GiWolfHead, GiRabbit, GiHighGrass } from "react-icons/gi";
import SpeciesImage from "@/components/SpeciesImage";

const TROPHIC_LABEL: Record<number, string> = {
  4: "高次消費者",
  3: "中次消費者",
  2: "一次消費者",
  1: "生産者",
};

// Symbolic silhouette for the *kind* (trophic role) of an undiscovered species:
// apex predator → lion, secondary consumer → wolf, primary consumer → rabbit,
// producer → grass.
const TROPHIC_ICON: Record<number, IconType> = {
  4: GiLion,
  3: GiWolfHead,
  2: GiRabbit,
  1: GiHighGrass,
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
  onSelect?: (species: Species, found: boolean) => void;
}

export default function Pyramid({ ecosystem, discovered, highlightId, compact, onSelect }: PyramidProps) {
  const inEco = SPECIES.filter((s) => s.ecosystem === ecosystem);
  const cellSize = compact ? "w-9 h-9" : "w-12 h-12 sm:w-14 sm:h-14";

  return (
    <div className="flex flex-col items-center gap-2">
      {[4, 3, 2, 1].map((level) => {
        const cells = inEco.filter((s) => s.trophicLevel === level);
        return (
          <div key={level} className="w-full flex flex-col items-center">
            {!compact && (
              <span className="text-[10px] font-medium text-forest-400 mb-1 tracking-wide">{TROPHIC_LABEL[level]}</span>
            )}
            <div
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-neutral-200/60 to-neutral-100/40 ring-1 ring-black/5 shadow-inset py-2.5 px-2"
              style={{ width: ROW_WIDTH[level] }}
            >
              {cells.map((s) => {
                const found = discovered.has(s.id);
                const isNew = s.id === highlightId;
                const KindIcon = TROPHIC_ICON[s.trophicLevel];
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelect?.(s, found)}
                    aria-label={found ? s.nameJa : `未発見の${TROPHIC_LABEL[s.trophicLevel]}`}
                    className={`${cellSize} rounded-full shrink-0 transition-all active:scale-95 ${
                      found
                        ? isNew
                          ? "ring-2 ring-gold-400 scale-110 shadow-[0_4px_12px_rgba(0,0,0,0.25)] overflow-hidden"
                          : "ring-2 ring-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] overflow-hidden"
                        : "bg-neutral-200/70 border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.18)] flex items-center justify-center text-neutral-400 hover:bg-neutral-200"
                    }`}
                  >
                    {found ? (
                      <SpeciesImage speciesId={s.id} emoji={s.emoji} alt={s.nameJa} className="w-full h-full" />
                    ) : (
                      <KindIcon size={compact ? 18 : 26} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
