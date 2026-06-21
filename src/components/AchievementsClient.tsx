"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCamera } from "react-icons/fi";
import { LuTrophy, LuLock } from "react-icons/lu";
import { ECOSYSTEM_LABEL, PYRAMID_TOTAL } from "@/data/species";
import { ECO_THEME } from "@/lib/theme";
import { TERRESTRIAL_PYRAMID_IDS } from "@/lib/demoScript";
import { ensureDemoSessionReady, fetchDemoStateSnapshot } from "@/lib/gameApi";
import Pyramid from "@/components/Pyramid";
import { PageHero, Screen, Card } from "@/components/ui";
import type { Ecosystem } from "@/lib/types";

const ECOS: Ecosystem[] = ["terrestrial", "freshwater", "marine"];

type Fill = Record<Ecosystem, string[]>;

/**
 * Achievements — a read-only gallery of the food-pyramids the player has
 * completed. Solves the "once a pyramid is completed it can't be viewed again"
 * problem: the terrestrial pyramid is flipped into an empty deck on completion,
 * so here we re-render it from its canonical full slot list.
 */
export default function AchievementsClient() {
  const [loading, setLoading] = useState(true);
  const [fill, setFill] = useState<Fill>({ terrestrial: [], freshwater: [], marine: [] });
  const [level, setLevel] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureDemoSessionReady();
      const snap = await fetchDemoStateSnapshot();
      if (!cancelled && snap) {
        setFill(snap.pyramidFill);
        setLevel(snap.pyramidLevel);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function status(eco: Ecosystem): { done: boolean; ids: string[]; count: number } {
    if (eco === "terrestrial") {
      // Completed terrestrial empties its live deck (round > 1); re-render the full set.
      const done = level > 1;
      return done
        ? { done, ids: TERRESTRIAL_PYRAMID_IDS, count: PYRAMID_TOTAL }
        : { done, ids: fill.terrestrial, count: fill.terrestrial.length };
    }
    const ids = fill[eco];
    return { done: ids.length >= PYRAMID_TOTAL, ids, count: ids.length };
  }

  const completedCount = loading ? 0 : ECOS.filter((e) => status(e).done).length;

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero
        title="実績"
        subtitle="これまでに完成させたピラミッド"
        gradient="from-gold-500 to-forest-700"
        right={
          <div className="text-right text-white">
            <div className="text-3xl font-extrabold leading-none">
              {completedCount}
              <span className="text-base font-bold">/3</span>
            </div>
            <div className="text-xs text-white/80 mt-1">達成</div>
          </div>
        }
      />
      <Screen>
        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-400">読み込み中…</div>
        ) : (
          <>
            {completedCount === 0 && (
              <Card className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <LuTrophy size={22} />
                </div>
                <p className="text-sm text-neutral-500 mt-2">
                  まだ完成したピラミッドはありません。
                  <br />
                  撮影で食物連鎖を完成させよう！
                </p>
                <Link
                  href="/capture"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-white bg-forest-600 rounded-xl px-5 py-2.5 btn3d"
                >
                  <FiCamera size={16} /> さがしに行く
                </Link>
              </Card>
            )}

            {ECOS.map((eco) => {
              const { done, ids, count } = status(eco);
              const theme = ECO_THEME[eco];
              const set = new Set(ids);
              return (
                <Card key={eco} className="!p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full ${theme.chip} flex items-center justify-center`}>
                        <theme.Icon size={16} />
                      </span>
                      <span className="font-bold text-neutral-800">{ECOSYSTEM_LABEL[eco]}の食物連鎖</span>
                    </div>
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-gold-400 to-gold-600 rounded-full px-2.5 py-1 badge3d">
                        <LuTrophy size={12} /> 完成
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400">
                        <LuLock size={12} /> {count}/{PYRAMID_TOTAL}
                      </span>
                    )}
                  </div>

                  {done ? (
                    <>
                      <Pyramid ecosystem={eco} discovered={set} activeIds={set} embedded />
                      <p className="text-xs text-center text-gold-600 font-semibold mt-3">
                        達成済み — {PYRAMID_TOTAL}種の食物連鎖が完成しました
                      </p>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 py-8 text-center">
                      <LuLock size={26} className="mx-auto text-neutral-300" />
                      <p className="text-sm text-neutral-500 mt-2 font-semibold">未完成（{count}/{PYRAMID_TOTAL}）</p>
                      <p className="text-xs text-neutral-400 mt-1">残りの生き物を撮影して完成させよう</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </Screen>
    </div>
  );
}
