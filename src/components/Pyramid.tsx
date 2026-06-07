import { SPECIES, PYRAMID_SLOTS } from "@/data/species";
import type { Ecosystem, Species } from "@/lib/types";
import type { IconType } from "react-icons";
import { LuChevronUp } from "react-icons/lu";
import { GiLion, GiWolfHead, GiRabbit, GiHighGrass } from "react-icons/gi";
import SpeciesImage from "@/components/SpeciesImage";
import PyramidTetrahedron from "@/components/PyramidTetrahedron";

/** Strong linear gradient per ecosystem — darker top, lighter bottom. */
const ECO_PYRAMID_BG: Record<Ecosystem, string> = {
  terrestrial: "bg-gradient-to-b from-forest-500 via-forest-100 to-white",
  freshwater: "bg-gradient-to-b from-teal-600 via-teal-100 to-white",
  marine: "bg-gradient-to-b from-lime-600 via-lime-100 to-white",
};

const TROPHIC_LABEL: Record<number, string> = {
  4: "高次消費者",
  3: "中次消費者",
  2: "一次消費者",
  1: "生産者",
};

const TROPHIC_ICON: Record<number, IconType> = {
  4: GiLion,
  3: GiWolfHead,
  2: GiRabbit,
  1: GiHighGrass,
};

/** Trapezoid clip-paths — top/bottom edges align so tiers stack into one pyramid. */
const TRAPEZOID: Record<number, string> = {
  4: "polygon(36% 0%, 64% 0%, 70% 100%, 30% 100%)",
  3: "polygon(30% 0%, 70% 0%, 78% 100%, 22% 100%)",
  2: "polygon(22% 0%, 78% 0%, 88% 100%, 12% 100%)",
  1: "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)",
};

/** Top-edge corner positions (%) for energy-flow arrows. */
const TIER_TOP: Record<number, [number, number]> = {
  4: [36, 64],
  3: [30, 70],
  2: [22, 78],
  1: [12, 88],
};

/** Horizontal gap between tiles — wider rows need more breathing room. */
const TIER_GAP: Record<number, string> = {
  4: "gap-2",
  3: "gap-2.5",
  2: "gap-3",
  1: "gap-2.5 sm:gap-3.5",
};

/** Horizontal inset from trapezoid edges to tile row. */
const TIER_PX: Record<number, string> = {
  4: "px-6 sm:px-9",
  3: "px-7 sm:px-10",
  2: "px-8 sm:px-11",
  1: "px-7 sm:px-14",
};

interface PyramidProps {
  ecosystem: Ecosystem;
  discovered: Set<string>;
  highlightId?: string;
  compact?: boolean;
  onSelect?: (species: Species, found: boolean) => void;
}

function SpeciesTile({
  s,
  level,
  found,
  isNew,
  compact,
  label,
  onSelect,
}: {
  s: Species;
  level: number;
  found: boolean;
  isNew: boolean;
  compact?: boolean;
  label: string;
  onSelect?: (species: Species, found: boolean) => void;
}) {
  const KindIcon = TROPHIC_ICON[level];
  const tile = compact ? "w-9 h-9 rounded-lg" : "w-[10vw] max-w-12 h-[10vw] max-h-12 min-w-9 min-h-9 rounded-xl sm:w-12 sm:h-12";

  return (
    <button
      onClick={() => onSelect?.(s, found)}
      aria-label={found ? s.nameJa : `未発見の${label}`}
      className={`relative ${tile} shrink-0 transition-all active:scale-95 ${
        found
          ? isNew
            ? "ring-2 ring-gold-400 shadow-[0_4px_12px_rgba(0,0,0,0.22)]"
            : "ring-1 ring-white shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
          : "bg-neutral-200/75 ring-1 ring-neutral-300/45 shadow-inset"
      } overflow-hidden`}
    >
      {found ? (
        <SpeciesImage
          speciesId={s.id}
          emoji={s.emoji}
          alt={s.nameJa}
          className="w-full h-full"
          rounded={compact ? "rounded-lg" : "rounded-xl"}
        />
      ) : (
        <span className="w-full h-full flex items-center justify-center text-neutral-400/70">
          <KindIcon size={compact ? 14 : 20} />
        </span>
      )}
      {isNew && found && (
        <span className="absolute -top-0.5 -right-0.5 text-[7px] font-bold bg-forest-600 text-white px-1 py-px rounded-full shadow leading-none">
          新！
        </span>
      )}
    </button>
  );
}

export default function Pyramid({ ecosystem, discovered, highlightId, compact, onSelect }: PyramidProps) {
  const inEco = SPECIES.filter((s) => s.ecosystem === ecosystem);
  const gap = compact ? "gap-1.5" : "";
  const levels = [4, 3, 2, 1] as const;

  if (compact) {
    return (
      <div className="rounded-xl bg-neutral-100 p-2">
        <div className="flex flex-col items-center gap-0.5">
          {levels.map((level) => {
            const cells = inEco.filter((s) => s.trophicLevel === level).slice(0, PYRAMID_SLOTS[level]);
            const widths = { 4: "w-[46%]", 3: "w-[62%]", 2: "w-[80%]", 1: "w-full" };
            return (
              <div key={level} className={`${widths[level]} flex justify-center bg-white/90 rounded-lg py-1 px-1.5 ${gap}`}>
                {cells.map((s) => (
                  <SpeciesTile
                    key={s.id}
                    s={s}
                    level={level}
                    found={discovered.has(s.id)}
                    isNew={s.id === highlightId}
                    compact
                    label={TROPHIC_LABEL[level]}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${ECO_PYRAMID_BG[ecosystem]} ring-1 ring-forest-200/25 px-2 py-4 sm:px-6 sm:py-8 transition-colors duration-300`}>
      <PyramidTetrahedron ecosystem={ecosystem} />

      {/* Same trapezoid pyramid on all screens — fixed aspect ratio on mobile */}
      <div className="relative z-10 flex w-full flex-col max-sm:aspect-[5/7]">
        {levels.map((level, index) => {
          const cells = inEco.filter((s) => s.trophicLevel === level).slice(0, PYRAMID_SLOTS[level]);
          const label = TROPHIC_LABEL[level];
          const [left, right] = TIER_TOP[level];

          return (
            <div
              key={level}
              className="relative w-full max-sm:flex-1 max-sm:min-h-0"
              style={{ marginTop: index > 0 ? 1 : 0 }}
            >
              {index > 0 && (
                <>
                  <LuChevronUp
                    size={12}
                    strokeWidth={2.5}
                    className="absolute -top-2.5 z-10 text-forest-500/80 -translate-x-1/2"
                    style={{ left: `${left}%` }}
                    aria-hidden
                  />
                  <LuChevronUp
                    size={12}
                    strokeWidth={2.5}
                    className="absolute -top-2.5 z-10 text-forest-500/80 translate-x-1/2"
                    style={{ left: `${right}%` }}
                    aria-hidden
                  />
                </>
              )}

              <div
                className="bg-gradient-to-b from-white via-white to-slate-50/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-forest-200/35 max-sm:h-full max-sm:flex max-sm:flex-col max-sm:justify-center"
                style={{ clipPath: TRAPEZOID[level] }}
              >
                <div className="text-center pt-1.5 pb-0.5 px-4 sm:pt-2.5 sm:pb-1.5 sm:px-8">
                  <div className="text-[9px] sm:text-[11px] font-bold text-neutral-700">{label}</div>
                </div>

                <div className={`flex items-center justify-center ${TIER_GAP[level]} ${TIER_PX[level]} pb-2 sm:pb-4`}>
                  {cells.map((s) => (
                    <SpeciesTile
                      key={s.id}
                      s={s}
                      level={level}
                      found={discovered.has(s.id)}
                      isNew={s.id === highlightId}
                      label={label}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
