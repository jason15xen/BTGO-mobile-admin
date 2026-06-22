"use client";

import { useState } from "react";
import Link from "next/link";
import CaptureLink from "@/components/CaptureLink";
import { LuSparkles, LuX, LuMapPin, LuCalendar, LuCamera } from "react-icons/lu";
import SpeciesImage from "@/components/SpeciesImage";
import { SPECIES_INFO } from "@/data/speciesInfo";
import { RARITY_THEME } from "@/lib/theme";

export type RareAlertNews = {
  speciesId: string;
  nameJa: string;
  nameSci: string;
  emoji: string;
  area: string;
  observedAt: string;
};

const fmtDate = (iso: string) => iso.slice(0, 10).replace(/-/g, "/");

export default function HomeRareAlert({ news }: { news: RareAlertNews }) {
  const [open, setOpen] = useState(false);
  const info = SPECIES_INFO[news.speciesId];
  const rarity = RARITY_THEME.legendary;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="card3d rounded-2xl px-3.5 py-3 text-left w-full active:scale-[0.99] transition-transform"
      >
        <div className="text-xs font-semibold text-gold-600 flex items-center gap-1">
          <LuSparkles size={12} className="animate-sparkle" /> レアアラート
        </div>
        <div className="flex items-center gap-2 mt-1">
          <SpeciesImage speciesId={news.speciesId} emoji={news.emoji} alt={news.nameJa} className="w-9 h-9 shrink-0" rounded="rounded-md" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-neutral-800 leading-tight truncate">{news.nameJa}</div>
            <div className="text-[11px] text-neutral-400">が出没しています！</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 modal-backdrop" role="dialog" aria-modal="true">
          {/* Full-screen takeover (fills the app frame). */}
          <div className="absolute inset-0 mx-auto w-full max-w-[480px] bg-white flex flex-col animate-fadeIn">
            {/* hero */}
            <div className="relative h-60 shrink-0 bg-neutral-100">
              <SpeciesImage speciesId={news.speciesId} emoji={news.emoji} alt={news.nameJa} className="w-full h-full" rounded="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/25" aria-hidden />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white drop-shadow">
                <LuSparkles size={16} className="animate-sparkle" />
                <span className="text-sm font-bold">レアアラート</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-4 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center active:bg-black/55"
                aria-label="閉じる"
              >
                <LuX size={18} />
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rarity.chip}`}>レジェンド</span>
                <h2 className="text-2xl font-extrabold mt-1.5 drop-shadow">{news.nameJa}</h2>
                <p className="text-xs italic text-white/85">{news.nameSci}</p>
              </div>
            </div>

            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              <p className="text-sm text-neutral-500">地域の最新ニュース</p>

              <div className="rounded-2xl bg-gold-50 border border-gold-100 p-4 space-y-2.5 text-sm">
                <div className="flex items-start gap-2 text-neutral-700">
                  <LuMapPin size={15} className="text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-neutral-400">出没エリア</div>
                    <div className="font-semibold">{news.area}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-neutral-700">
                  <LuCalendar size={15} className="text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-neutral-400">最終確認</div>
                    <div className="font-semibold">{fmtDate(news.observedAt)}</div>
                  </div>
                </div>
              </div>

              {info && (
                <div className="space-y-3 text-sm">
                  <p className="text-neutral-700 leading-relaxed">{info.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-neutral-50 px-3 py-2">
                      <div className="text-[10px] text-neutral-400">生息地</div>
                      <div className="font-medium text-neutral-800 text-xs mt-0.5">{info.habitat}</div>
                    </div>
                    <div className="rounded-xl bg-neutral-50 px-3 py-2">
                      <div className="text-[10px] text-neutral-400">食べ物</div>
                      <div className="font-medium text-neutral-800 text-xs mt-0.5">{info.diet}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* pinned CTA */}
            <div className="shrink-0 p-4 border-t border-neutral-100 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <CaptureLink
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-forest-600 text-white font-bold rounded-xl py-3.5 btn3d"
              >
                <LuCamera size={18} />
                さがしに行く
              </CaptureLink>
              <button onClick={() => setOpen(false)} className="w-full text-sm font-semibold text-neutral-500 py-2">
                とじる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
