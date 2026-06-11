"use client";

import { PageHero, Screen, Card } from "@/components/ui";
import type { RankEntry } from "@/lib/ranking";

const MONTH_LABEL = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long" });

export default function RankingClient({
  entries,
  myUserId,
}: {
  entries: RankEntry[];
  myUserId: string | null;
}) {
  const myRank = entries.find((e) => e.userId === myUserId);

  return (
    <div className="min-h-full bg-forest-50">
      <PageHero title="月間ランキング" subtitle={`${MONTH_LABEL} — 総合`} gradient="from-gold-500 to-forest-700" />
      <Screen className="space-y-4">
        {myRank && (
          <Card className="-mt-9 relative z-10">
            <div className="text-xs text-neutral-400">あなたの順位</div>
            <div className="flex items-end justify-between mt-1">
              <div className="text-3xl font-extrabold text-forest-700">#{myRank.rank}</div>
              <div className="text-right">
                <div className="text-lg font-bold text-gold-600">{myRank.score} pt</div>
                <div className="text-xs text-neutral-400">{myRank.speciesCount} 種 ・ {myRank.captureCount} 回</div>
              </div>
            </div>
          </Card>
        )}

        <Card className="!p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 text-sm font-bold text-neutral-700">総合ランキング</div>
          <ul className="divide-y divide-neutral-50">
            {entries.slice(0, 20).map((e) => {
              const isMe = e.userId === myUserId;
              return (
                <li
                  key={e.userId}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-forest-50" : ""}`}
                >
                  <span
                    className={`w-8 text-center font-extrabold text-sm ${
                      e.rank <= 3 ? "text-gold-600" : "text-neutral-400"
                    }`}
                  >
                    {e.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${isMe ? "text-forest-800" : "text-neutral-800"}`}>
                      {e.userName}{isMe && "（あなた）"}
                    </div>
                    <div className="text-[11px] text-neutral-400">{e.speciesCount} 種 ・ {e.captureCount} 回</div>
                  </div>
                  <div className="text-sm font-bold text-neutral-700">{e.score}</div>
                </li>
              );
            })}
          </ul>
        </Card>

        <p className="text-xs text-center text-neutral-400 px-4">
          PoC版：今月の投稿をB-mile相当で集計した総合ランキングです
        </p>
      </Screen>
    </div>
  );
}
