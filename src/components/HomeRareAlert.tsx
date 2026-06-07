"use client";

import { useState } from "react";
import Link from "next/link";
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
          <LuSparkles size={12} /> レアアラート
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-[440px] max-h-[88vh] overflow-y-auto no-scrollbar bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-5 pt-5 pb-3 border-b border-neutral-100">
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500"
                aria-label="閉じる"
              >
                <LuX size={16} />
              </button>
              <div className="flex items-center gap-2 text-gold-600">
                <LuSparkles size={18} />
                <h2 className="text-lg font-bold text-neutral-900">レアアラート</h2>
              </div>
              <p className="text-sm text-neutral-500 mt-1">地域の最新ニュース</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-4">
                <SpeciesImage speciesId={news.speciesId} emoji={news.emoji} alt={news.nameJa} className="w-24 h-24 shrink-0" rounded="rounded-2xl" />
                <div className="min-w-0 pt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rarity.chip}`}>レジェンド</span>
                  <h3 className="text-xl font-bold text-neutral-900 mt-1.5">{news.nameJa}</h3>
                  <p className="text-xs text-neutral-400 italic mt-0.5">{news.nameSci}</p>
                </div>
              </div>

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

              <Link
                href="/capture"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-forest-600 text-white font-bold rounded-xl py-3 btn3d"
              >
                <LuCamera size={18} />
                さがしに行く
              </Link>
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
