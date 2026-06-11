"use client";

import { useState } from "react";
import { LuX, LuMapPin, LuCalendar, LuHash, LuArrowLeft, LuActivity } from "react-icons/lu";
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
  pw,
  onClose,
}: {
  species: Species;
  discovery: Discovery;
  pw?: number;
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-[440px] max-h-[88vh] overflow-y-auto no-scrollbar bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl modal-sheet" onClick={(e) => e.stopPropagation()}>
        {showMap ? (
          <div>
            <div className="flex items-center gap-2 p-3 border-b border-neutral-100">
              <button onClick={() => setShowMap(false)} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                <LuArrowLeft size={16} />
              </button>
              <div className="font-bold text-neutral-800 flex items-center gap-1.5 min-w-0">
                <LuMapPin size={15} className={`shrink-0 ${theme.text}`} />
                <span className="truncate">{discovery.area}</span>
              </div>
            </div>
            <iframe title="発見場所" src={mapSrc} className="w-full h-72 border-0" />
            <div className="p-3">
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
          <div className="p-3 space-y-2.5">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <SpeciesImage speciesId={species.id} emoji={species.emoji} alt={species.nameJa} className="w-full h-full" rounded="rounded-2xl" />
              <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center">
                <LuX size={16} />
              </button>
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${rarity.chip}`}>{rarity.label}</span>
            </div>

            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-neutral-400">No.{dexNo(species.id)} ・ {ECOSYSTEM_LABEL[species.ecosystem]}</div>
                <h2 className="text-lg font-bold text-neutral-800 leading-tight">{species.nameJa}</h2>
                <div className="text-xs italic text-neutral-500">{species.nameSci}</div>
              </div>
              <button
                onClick={() => setShowMap(true)}
                title={discovery.area}
                className={`shrink-0 w-8 h-8 rounded-full ${theme.chip} flex items-center justify-center mt-0.5`}
              >
                <LuMapPin size={15} />
              </button>
            </div>

            <div className="rounded-xl bg-neutral-50 px-3 py-1 divide-y divide-neutral-100">
              <StatRow icon={<LuCalendar size={13} />} label="発見日" value={fmtDate(discovery.firstFound)} />
              <StatRow icon={<span className="text-gold-500 font-bold text-[10px]">B</span>} label="獲得B-mile" value={`+${bmile}`} accent />
              <StatRow icon={<LuHash size={13} />} label="観察回数" value={`${discovery.count} 回`} />
              {pw !== undefined && <StatRow icon={<LuActivity size={13} />} label="生命力" value={`${pw} pw`} />}
              {info?.habitat && <StatRow icon={<LuMapPin size={13} />} label="生息地" value={info.habitat} />}
            </div>

            {info?.description && (
              <p className="text-sm text-neutral-600 leading-snug">{info.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[11px] text-neutral-400 flex items-center gap-1 shrink-0">{icon} {label}</span>
      <span className={`text-sm font-bold text-right ${accent ? "text-gold-600" : "text-neutral-800"}`}>{value}</span>
    </div>
  );
}
