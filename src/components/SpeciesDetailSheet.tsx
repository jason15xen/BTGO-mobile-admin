"use client";

import { useState } from "react";
import { LuX, LuMapPin, LuCalendar, LuHash, LuLayers, LuArrowLeft } from "react-icons/lu";
import SpeciesImage from "@/components/SpeciesImage";
import { SPECIES, ECOSYSTEM_LABEL } from "@/data/species";
import { SPECIES_INFO } from "@/data/speciesInfo";
import { ECO_THEME, RARITY_THEME } from "@/lib/theme";
import { rewardFor, type Discovery } from "@/lib/game";
import type { Species } from "@/lib/types";

const fmtDate = (iso: string) => iso.slice(0, 10).replace(/-/g, "/");
const dexNo = (id: string) => String(SPECIES.findIndex((s) => s.id === id) + 1).padStart(3, "0");

export default function SpeciesDetailSheet({
  species,
  discovery,
  onClose,
}: {
  species: Species;
  discovery: Discovery;
  onClose: () => void;
}) {
  const [showMap, setShowMap] = useState(false);
  const info = SPECIES_INFO[species.id];
  const theme = ECO_THEME[species.ecosystem];
  const rarity = RARITY_THEME[species.rarity];
  const bmile = rewardFor(species).points;

  const d = 0.012;
  const bbox = `${discovery.lng - d},${discovery.lat - d},${discovery.lng + d},${discovery.lat + d}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${discovery.lat},${discovery.lng}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-[440px] max-h-[88vh] overflow-y-auto no-scrollbar bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {showMap ? (
          <div>
            <div className="flex items-center gap-2 p-4 border-b border-neutral-100">
              <button onClick={() => setShowMap(false)} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                <LuArrowLeft size={16} />
              </button>
              <div className="font-bold text-neutral-800 flex items-center gap-1.5">
                <LuMapPin size={16} className={theme.text} /> {discovery.area} で発見
              </div>
            </div>
            <iframe title="発見場所" src={mapSrc} className="w-full h-72 border-0" />
            <div className="p-4">
              <a
                href={`https://www.openstreetmap.org/?mlat=${discovery.lat}&mlon=${discovery.lng}#map=15/${discovery.lat}/${discovery.lng}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-sm font-semibold text-forest-600"
              >
                大きな地図で見る ↗
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="relative h-48">
              <SpeciesImage speciesId={species.id} emoji={species.emoji} alt={species.nameJa} className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center">
                <LuX size={16} />
              </button>
              <span className={`absolute top-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded-full ${rarity.chip}`}>{rarity.label}</span>
              <div className="absolute bottom-3 left-4 text-white">
                <div className="text-[11px] opacity-80">No.{dexNo(species.id)} ・ {ECOSYSTEM_LABEL[species.ecosystem]}</div>
                <div className="text-xl font-bold drop-shadow">{species.nameJa}</div>
                <div className="text-xs italic opacity-90">{species.nameSci}</div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* key facts */}
              <div className="grid grid-cols-2 gap-2.5">
                <Fact icon={<LuCalendar size={14} />} label="発見日" value={fmtDate(discovery.firstFound)} />
                <Fact icon={<LuLayers size={14} />} label="栄養段階" value={`Lv.${species.trophicLevel}`} />
                <Fact icon={<span className="text-gold-500 font-bold text-xs">B</span>} label="獲得B-mile" value={`+${bmile}`} accent />
                <Fact icon={<LuHash size={14} />} label="観察回数" value={`${discovery.count} 回`} />
              </div>

              {/* location → map */}
              <button
                onClick={() => setShowMap(true)}
                className="w-full flex items-center gap-3 bg-neutral-50 hover:bg-neutral-100 rounded-2xl p-3 text-left transition-colors"
              >
                <span className={`w-9 h-9 rounded-full ${theme.chip} flex items-center justify-center`}>
                  <LuMapPin size={16} />
                </span>
                <div className="flex-1">
                  <div className="text-[11px] text-neutral-400">発見場所</div>
                  <div className="text-sm font-semibold text-neutral-700">{discovery.area}</div>
                </div>
                <span className="text-sm font-semibold text-forest-600">地図で見る ›</span>
              </button>

              {/* description */}
              <div className="space-y-2">
                <p className="text-sm text-neutral-600 leading-relaxed">{info?.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <MiniFact label="🗺️ 生息地" value={info?.habitat ?? "—"} />
                  <MiniFact label="🍽️ 食べ物" value={info?.diet ?? "—"} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Fact({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ${accent ? "bg-gold-50 border border-gold-100" : "bg-neutral-50"}`}>
      <div className="text-[11px] text-neutral-400 flex items-center gap-1">{icon} {label}</div>
      <div className={`text-base font-bold mt-0.5 ${accent ? "text-gold-600" : "text-neutral-800"}`}>{value}</div>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-xl px-3 py-2">
      <div className="text-[11px] text-neutral-400">{label}</div>
      <div className="font-semibold text-neutral-700">{value}</div>
    </div>
  );
}
