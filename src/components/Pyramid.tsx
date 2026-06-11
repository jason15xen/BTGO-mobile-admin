import { SPECIES, PYRAMID_SLOTS } from "@/data/species";
import { pwTileScale, pwVisual } from "@/lib/creature";
import type { Ecosystem, Species } from "@/lib/types";
import type { IconType } from "react-icons";
import { LuChevronUp } from "react-icons/lu";
import { slotHintFor } from "@/lib/slotHint";
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

function EmptySlotHint({
  species,
  level,
  embedded,
}: {
  species: Species;
  level: number;
  embedded?: boolean;
}) {
  const hint = slotHintFor(species);
  const TrophicIcon = TROPHIC_ICON[level];
  const HintIcon = hint.Icon;
  return (
    <span
      className={`w-full h-full flex flex-col items-center justify-center gap-0.5 bg-gradient-to-br ${hint.bgClass} border border-dashed border-neutral-300/80 px-0.5`}
    >
      <TrophicIcon
        size={embedded ? 11 : 12}
        className="text-neutral-400/70 shrink-0"
        aria-hidden
      />
      <HintIcon
        size={embedded ? 16 : 18}
        className={`${hint.iconClass} shrink-0`}
        aria-hidden
      />
      <span className={`text-[6px] sm:text-[7px] font-bold leading-none text-center ${hint.rarityClass}`}>
        {hint.rarityLabel}
      </span>
      <span className="text-[6px] sm:text-[7px] font-semibold text-neutral-600 leading-none text-center line-clamp-1 w-full px-0.5">
        {hint.categoryLabel}
      </span>
      <span className="text-[5px] sm:text-[6px] text-neutral-400 leading-none text-center line-clamp-1 w-full px-0.5">
        {hint.habitatCue}
      </span>
      {species.invasive && (
        <span className="text-[5px] font-bold text-red-500 leading-none">外来?</span>
      )}
    </span>
  );
}

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

const TIER_GAP: Record<number, { full: string; embedded: string }> = {
  4: { full: "gap-2", embedded: "gap-2" },
  3: { full: "gap-2.5", embedded: "gap-2" },
  2: { full: "gap-3", embedded: "gap-2.5" },
  1: { full: "gap-2.5 sm:gap-3.5", embedded: "gap-2.5" },
};

const TIER_STAGGER = ["stagger-1", "stagger-2", "stagger-3", "stagger-4"] as const;

const TIER_PX: Record<number, { full: string; embedded: string }> = {
  4: { full: "px-6 sm:px-9", embedded: "px-5" },
  3: { full: "px-7 sm:px-10", embedded: "px-5" },
  2: { full: "px-8 sm:px-11", embedded: "px-4" },
  1: { full: "px-7 sm:px-14", embedded: "px-3" },
};

const STAR_BURST_COUNT = 28;

/** Stars continuously eject from the tile perimeter. */
function StarlightFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="species-starlight relative flex items-center justify-center w-[3.5rem] h-[3.5rem] shrink-0">
      <div className="species-starlight__halo" aria-hidden />
      <div className="absolute inset-0 overflow-visible pointer-events-none" aria-hidden>
        {Array.from({ length: STAR_BURST_COUNT }, (_, i) => {
          const angle = (360 / STAR_BURST_COUNT) * i;
          const delay = (i / STAR_BURST_COUNT) * 1.6;
          return (
            <span
              key={i}
              className={`species-star-particle${i % 4 === 0 ? " species-star-particle--bright" : ""}`}
              style={
                {
                  "--star-angle": `${angle}deg`,
                  "--star-delay": `${delay}s`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface PyramidProps {
  ecosystem: Ecosystem;
  discovered: Set<string>;
  highlightId?: string;
  /** Smaller copy of the same trapezoid pyramid (e.g. capture reflection). */
  embedded?: boolean;
  /** Species currently visible on the pyramid (pw &gt; 0). */
  activeIds?: Set<string>;
  /** Starved individuals — stay in place, grayed out (spec §3.1). */
  extinctIds?: Set<string>;
  /** Invasive species isolated with a protection fence (保護柵). */
  fencedIds?: Set<string>;
  /** Latest pw per species — drives size / weakness visuals. */
  pwMap?: Record<string, number>;
  /** Reddish tone when invasive species are present in this pyramid. */
  invasiveThreat?: boolean;
  /** First-tap selection — prominent until second tap opens detail. */
  selectedId?: string | null;
  onSelect?: (species: Species, showPhoto: boolean) => void;
  /** Species ids that can receive a dragged feed. */
  feedDropTargets?: Set<string>;
  feedHoverId?: string | null;
  onFeedHover?: (speciesId: string | null) => void;
  onFeedDrop?: (speciesId: string) => void;
}

function PyramidTile({
  s,
  level,
  showPhoto,
  isNew,
  embedded,
  label,
  pw,
  extinct,
  fenced,
  isSelected,
  onSelect,
  canReceiveFeed,
  isFeedHover,
  onFeedHover,
  onFeedDrop,
}: {
  s: Species;
  level: number;
  showPhoto: boolean;
  isNew: boolean;
  embedded?: boolean;
  label: string;
  pw?: number;
  extinct?: boolean;
  fenced?: boolean;
  isSelected?: boolean;
  onSelect?: (species: Species, showPhoto: boolean) => void;
  canReceiveFeed?: boolean;
  isFeedHover?: boolean;
  onFeedHover?: (speciesId: string | null) => void;
  onFeedDrop?: (speciesId: string) => void;
}) {
  const tile = embedded
    ? "w-11 h-11 rounded-lg"
    : "w-[10vw] max-w-12 h-[10vw] max-h-12 min-w-9 min-h-9 rounded-xl sm:w-12 sm:h-12";

  const visual = showPhoto && !extinct && pw !== undefined ? pwVisual(pw) : "normal";
  const vitalityScale = showPhoto && !extinct && pw !== undefined ? pwTileScale(pw) : extinct ? 0.9 : 1;
  const inner = (
    <>
      {showPhoto ? (
        <div
          className={`w-full h-full flex items-center justify-center ${
            extinct
              ? "grayscale opacity-60"
              : visual === "weak"
              ? "opacity-80 saturate-75"
              : visual === "strong"
              ? "saturate-110"
              : ""
          }`}
        >
          <SpeciesImage
            speciesId={s.id}
            emoji={s.emoji}
            alt={s.nameJa}
            className="w-full h-full"
            rounded={embedded ? "rounded-lg" : "rounded-xl"}
          />
        </div>
      ) : (
        <EmptySlotHint species={s} level={level} embedded={embedded} />
      )}
      {isNew && showPhoto && (
        <span className="absolute top-0.5 right-0.5 text-[7px] font-bold bg-gold-500 text-white px-1 py-px rounded-full leading-none z-20">
          新
        </span>
      )}
      {showPhoto && s.invasive && !extinct && (
        <span className={`absolute bottom-0.5 left-0.5 text-[6px] font-bold text-white px-1 py-px rounded leading-none z-20 ${fenced ? "bg-sky-500" : "bg-red-500"}`}>
          {fenced ? "柵" : "外来"}
        </span>
      )}
      {extinct && (
        <span className="absolute bottom-0.5 left-0.5 text-[6px] font-bold bg-neutral-400 text-white px-1 py-px rounded leading-none z-20">
          消滅
        </span>
      )}
      {isSelected && (
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] font-bold bg-forest-600 text-white px-1.5 py-px rounded-full leading-none z-30 whitespace-nowrap shadow">
          もう一度
        </span>
      )}
    </>
  );

  const ringCls = isFeedHover && canReceiveFeed
    ? "ring-[3px] ring-forest-500 shadow-[0_0_14px_3px_rgba(63,125,73,0.45)]"
    : canReceiveFeed
      ? "ring-2 ring-dashed ring-forest-400/70"
      : isSelected
    ? "ring-[3px] ring-forest-400"
    : extinct
      ? "ring-1 ring-neutral-300/60"
    : showPhoto
      ? s.invasive
        ? fenced
          ? "ring-[3px] ring-sky-500 shadow-[0_0_10px_2px_rgba(14,165,233,0.4)]"
          : "ring-[3px] ring-red-500 shadow-[0_0_12px_2px_rgba(239,68,68,0.45)]"
        : isNew
          ? "ring-[3px] ring-amber-400 shadow-[0_0_14px_3px_rgba(251,191,36,0.75)]"
          : "ring-1 ring-white shadow-[0_2px_8px_rgba(0,0,0,0.16)]"
      : "bg-neutral-200/75 ring-1 ring-neutral-300/45 shadow-inset";

  const selectedCls = isSelected
    ? showPhoto
      ? s.invasive
        ? "pyramid-tile-selected pyramid-tile-selected--invasive"
        : "pyramid-tile-selected"
      : "pyramid-tile-selected pyramid-tile-selected--undiscovered"
    : "";

  const pressCls = onSelect && !isSelected ? "active:scale-95" : "";
  const cls = ["relative", tile, "shrink-0", "transition-all", selectedCls, pressCls, ringCls, "overflow-visible"]
    .filter(Boolean)
    .join(" ");

  const dropHandlers = canReceiveFeed && onFeedDrop
    ? {
        "data-drop-species": s.id,
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          onFeedHover?.(s.id);
        },
        onDragLeave: () => onFeedHover?.(null),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          onFeedHover?.(null);
          onFeedDrop(s.id);
        },
      }
    : showPhoto || canReceiveFeed
      ? { "data-drop-species": s.id }
      : {};

  const tileEl = onSelect ? (
    <button
      type="button"
      onClick={() => onSelect(s, showPhoto)}
      aria-label={
        showPhoto
          ? s.nameJa
          : `${label}・${s.category}・${slotHintFor(s).habitatCue}の枠（未確認）`
      }
      className={cls}
      {...dropHandlers}
    >
      {inner}
    </button>
  ) : (
    <div className={cls} {...dropHandlers}>{inner}</div>
  );

  const scaled = (
    <div
      className="transition-transform duration-300 ease-out origin-center"
      style={{ transform: `scale(${vitalityScale})` }}
    >
      {tileEl}
    </div>
  );

  if (isNew && showPhoto) {
    return <StarlightFrame>{scaled}</StarlightFrame>;
  }

  return scaled;
}

export default function Pyramid({
  ecosystem,
  discovered,
  highlightId,
  embedded,
  activeIds,
  extinctIds,
  fencedIds,
  pwMap,
  invasiveThreat,
  selectedId,
  onSelect,
  feedDropTargets,
  feedHoverId,
  onFeedHover,
  onFeedDrop,
}: PyramidProps) {
  const inEco = SPECIES.filter((s) => s.ecosystem === ecosystem);
  const levels = [4, 3, 2, 1] as const;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${ECO_PYRAMID_BG[ecosystem]} ring-1 transition-colors duration-300 ${
        invasiveThreat ? "ring-red-300/50" : "ring-forest-200/25"
      } ${embedded ? "px-2 py-3" : "px-2 py-4 sm:px-6 sm:py-8"}`}
    >
      {invasiveThreat && (
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-red-500/5 to-transparent pointer-events-none z-[1]" aria-hidden />
      )}
      {!embedded && <PyramidTetrahedron ecosystem={ecosystem} />}

      <div className={`relative z-10 flex w-full flex-col ${embedded ? "aspect-[5/7] min-h-[300px]" : "max-sm:aspect-[5/7]"}`}>
        {levels.map((level, index) => {
          const cells = inEco.filter((s) => s.trophicLevel === level).slice(0, PYRAMID_SLOTS[level]);
          const label = TROPHIC_LABEL[level];
          const [left, right] = TIER_TOP[level];
          const gap = TIER_GAP[level][embedded ? "embedded" : "full"];
          const px = TIER_PX[level][embedded ? "embedded" : "full"];

          return (
            <div
              key={level}
              className={`relative w-full opacity-0-start animate-fadeUp ${TIER_STAGGER[index]} ${embedded ? "flex-1 min-h-0" : "max-sm:flex-1 max-sm:min-h-0"}`}
              style={{ marginTop: index > 0 ? 1 : 0 }}
            >
              {index > 0 && (
                <>
                  <LuChevronUp
                    size={embedded ? 10 : 12}
                    strokeWidth={2.5}
                    className="absolute -top-2 z-10 text-forest-500/80 -translate-x-1/2"
                    style={{ left: `${left}%` }}
                    aria-hidden
                  />
                  <LuChevronUp
                    size={embedded ? 10 : 12}
                    strokeWidth={2.5}
                    className="absolute -top-2 z-10 text-forest-500/80 translate-x-1/2"
                    style={{ left: `${right}%` }}
                    aria-hidden
                  />
                </>
              )}

              <div
                className={`bg-gradient-to-b from-white via-white to-slate-50/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-forest-200/35 ${
                  embedded ? "h-full flex flex-col justify-center" : "max-sm:h-full max-sm:flex max-sm:flex-col max-sm:justify-center"
                }`}
                style={{ clipPath: TRAPEZOID[level] }}
              >
                <div className={`text-center ${embedded ? "pt-1.5 pb-0.5 px-2" : "pt-1.5 pb-0.5 px-4 sm:pt-2.5 sm:pb-1.5 sm:px-8"}`}>
                  <div className={`font-bold text-neutral-700 ${embedded ? "text-[9px]" : "text-[9px] sm:text-[11px]"}`}>
                    {label}
                  </div>
                </div>

                <div className={`flex items-center justify-center overflow-visible ${gap} ${px} ${embedded ? "pb-2.5" : "pb-2 sm:pb-4"}`}>
                  {cells.map((s) => {
                    const active = activeIds ? activeIds.has(s.id) : discovered.has(s.id);
                    const extinct = !active && Boolean(extinctIds?.has(s.id));
                    const showPhoto = active || extinct;
                    const canReceiveFeed = Boolean(
                      feedDropTargets?.has(s.id) && onFeedDrop && !extinct,
                    );
                    return (
                      <PyramidTile
                        key={s.id}
                        s={s}
                        level={level}
                        showPhoto={showPhoto}
                        isNew={s.id === highlightId}
                        embedded={embedded}
                        label={label}
                        pw={pwMap?.[s.id]}
                        extinct={extinct}
                        fenced={fencedIds?.has(s.id)}
                        isSelected={selectedId === s.id}
                        onSelect={onSelect}
                        canReceiveFeed={canReceiveFeed}
                        isFeedHover={feedHoverId === s.id}
                        onFeedHover={onFeedHover}
                        onFeedDrop={onFeedDrop}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
