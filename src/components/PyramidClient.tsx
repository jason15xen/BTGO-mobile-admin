"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuLightbulb, LuX, LuInfo, LuUtensils } from "react-icons/lu";
import { slotHintFor } from "@/lib/slotHint";
import Pyramid from "@/components/Pyramid";
import { ECOSYSTEM_LABEL, SPECIES_BY_ID } from "@/data/species";
import { SPECIES_INFO } from "@/data/speciesInfo";
import { ECO_THEME } from "@/lib/theme";
import { validPredatorsForFeed } from "@/lib/feedRules";
import { fetchGameState, postFeed } from "@/lib/gameApi";
import type { Ecosystem, FeedItem } from "@/lib/types";
import { PageHero, Screen, Card, ProgressBar } from "@/components/ui";
import SpeciesDetailSheet from "@/components/SpeciesDetailSheet";
import type { Discovery } from "@/lib/game";
import type { Species } from "@/lib/types";

const TABS: { key: Ecosystem }[] = [{ key: "terrestrial" }, { key: "freshwater" }, { key: "marine" }];

const ACTIVE_TAB_BG: Record<Ecosystem, string> = {
  terrestrial: "bg-forest-200",
  freshwater: "bg-teal-100",
  marine: "bg-lime-100",
};

const ECO_PROGRESS_TONE = {
  terrestrial: "forest",
  freshwater: "teal",
  marine: "lime",
} as const;

const ECO_HINT: Record<Ecosystem, { season: string; time: string; region: string }> = {
  terrestrial: { season: "春〜秋が活発", time: "朝・夕方", region: "山麓・里山方面" },
  freshwater: { season: "初夏〜秋", time: "明け方・夕暮れ", region: "湖沼・河川の水辺" },
  marine: { season: "夏〜秋", time: "日中〜潮の変わり目", region: "海岸・河口付近" },
};

export default function PyramidClient({
  userId,
  discovered,
  totals,
  discoveries,
}: {
  userId: string;
  discovered: string[];
  totals: Record<string, number>;
  discoveries: Record<string, Discovery>;
}) {
  const [eco, setEco] = useState<Ecosystem>("terrestrial");
  const [sel, setSel] = useState<{ s: Species; found: boolean } | null>(null);
  const [help, setHelp] = useState(false);
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [pwMap, setPwMap] = useState<Record<string, number>>({});
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [dragFeed, setDragFeed] = useState<FeedItem | null>(null);
  const [feedHoverId, setFeedHoverId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<FeedItem | null>(null);
  const set = useMemo(() => new Set(discovered), [discovered]);

  const [invasive, setInvasive] = useState<Record<Ecosystem, boolean>>({
    terrestrial: false,
    freshwater: false,
    marine: false,
  });

  const refreshGame = useCallback(async () => {
    const state = await fetchGameState();
    setFeeds(state.feeds);
    setPwMap(state.pwMap);
    setActiveIds(new Set(state.activeIds));
    setInvasive(state.invasive);
  }, []);

  useEffect(() => {
    refreshGame().finally(() => setMounted(true));
  }, [refreshGame, userId, discovered]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const total = totals[eco] ?? 0;
  const found = discovered.filter((id) => id.startsWith(eco[0] + "-")).length;
  const pct = total ? Math.round((found / total) * 100) : 0;
  const invasiveThreat = mounted && invasive[eco];
  const ecoFeeds = mounted ? feeds.filter((f) => f.ecosystem === eco) : [];
  const totalFeeds = mounted ? feeds.length : 0;
  const feedsOnOtherTab = totalFeeds > 0 && ecoFeeds.length === 0;

  function onTileSelect(s: Species, activeTile: boolean) {
    if (highlightedId === s.id) {
      setHighlightedId(null);
      setSel({ s, found: activeTile });
      return;
    }
    setSel(null);
    setHighlightedId(s.id);
  }

  const feedDropTargets = useMemo(() => {
    if (!dragFeed) return new Set<string>();
    return new Set(validPredatorsForFeed(dragFeed, set).map((p) => p.id));
  }, [dragFeed, set]);

  function speciesAtPoint(x: number, y: number, allowed?: Set<string>): string | null {
    for (const el of document.elementsFromPoint(x, y)) {
      const id = el.closest("[data-drop-species]")?.getAttribute("data-drop-species");
      if (id && (!allowed || allowed.has(id))) return id;
    }
    return null;
  }

  function clearFeedDrag() {
    dragRef.current = null;
    setDragFeed(null);
    setFeedHoverId(null);
    setDragPos(null);
    document.body.style.touchAction = "";
    document.body.style.userSelect = "";
  }

  async function dropFeedOn(feed: FeedItem, targetSpeciesId: string) {
    if (!mounted) return;
    const result = await postFeed(feed.id, targetSpeciesId);
    if (!result.ok) {
      if (result.reason === "no-predator") {
        setToast("まだひとつ上の段階の生き物を発見していません");
      } else if (result.reason === "invalid-target") {
        setToast("この生き物には餌を与えられません");
      }
      return;
    }
    setToast(`${result.predatorName} が餌を食べて +${result.gained}pw！（現在 ${result.newPw}pw）`);
    refreshGame();
  }

  function startFeedDrag(feed: FeedItem, e: React.PointerEvent<HTMLElement>) {
    const predators = validPredatorsForFeed(feed, set);
    if (predators.length === 0 || feed.trophicLevel >= 4) return;
    e.preventDefault();
    e.stopPropagation();

    const handle = e.currentTarget;
    const pointerId = e.pointerId;
    const targetIds = new Set(predators.map((p) => p.id));
    dragRef.current = feed;
    setDragFeed(feed);
    setDragPos({ x: e.clientX, y: e.clientY });
    setFeedHoverId(speciesAtPoint(e.clientX, e.clientY, targetIds));
    document.body.style.touchAction = "none";
    document.body.style.userSelect = "none";

    try {
      handle.setPointerCapture(pointerId);
    } catch {
      /* capture unsupported — window listeners below still handle the drag */
    }

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      setDragPos({ x: ev.clientX, y: ev.clientY });
      setFeedHoverId(speciesAtPoint(ev.clientX, ev.clientY, targetIds));
    };

    const onEnd = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      cleanup();
      const feedItem = dragRef.current;
      const targetId = speciesAtPoint(ev.clientX, ev.clientY, targetIds);
      clearFeedDrag();
      if (feedItem && targetId) {
        void dropFeedOn(feedItem, targetId);
      }
    };

    const cleanup = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      try {
        handle.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function startNativeFeedDrag(feed: FeedItem, e: React.DragEvent<HTMLElement>) {
    const predators = validPredatorsForFeed(feed, set);
    if (predators.length === 0 || feed.trophicLevel >= 4) {
      e.preventDefault();
      return;
    }
    dragRef.current = feed;
    setDragFeed(feed);
    e.dataTransfer.setData("application/feed-id", feed.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function endNativeFeedDrag() {
    if (!dragRef.current) return;
    clearFeedDrag();
  }

  async function onFeedDropOnTile(targetSpeciesId: string) {
    const feed = dragRef.current ?? dragFeed;
    if (!feed) return;
    await dropFeedOn(feed, targetSpeciesId);
    clearFeedDrag();
  }

  return (
    <div>
      <PageHero
        title="生態系ピラミッド"
        subtitle="発見した生き物で食物連鎖を完成させよう"
        gradient={`${ECO_THEME[eco].gradient}`}
        bgImage={`/eco/${eco}.webp`}
        right={
          <button
            onClick={() => setHelp(true)}
            aria-label="ヘルプ"
            className="w-9 h-9 rounded-full bg-white/20 active:bg-white/30 flex items-center justify-center text-white shrink-0"
          >
            <LuInfo size={18} />
          </button>
        }
      />
      <Screen>
        <div className="relative z-10 -mt-6 flex gap-1 rounded-2xl bg-white p-1 float3d">
          {TABS.map((t) => {
            const Icon = ECO_THEME[t.key].Icon;
            const activeTab = eco === t.key;
            return (
              <button
                key={t.key}
                onClick={() => { setEco(t.key); setHighlightedId(null); }}
                className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-900 transition-colors ${
                  activeTab ? ACTIVE_TAB_BG[t.key] : "bg-white active:bg-neutral-50"
                }`}
              >
                <Icon size={16} />
                {ECOSYSTEM_LABEL[t.key]}
              </button>
            );
          })}
        </div>

        <Card className="!p-4 sm:!p-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-semibold text-neutral-700">{ECOSYSTEM_LABEL[eco]}の食物連鎖</span>
            <span className={`text-sm font-bold ${ECO_THEME[eco].text}`}>{found}/{total} 種 ・ {pct}%</span>
          </div>
          <ProgressBar value={pct} tone={ECO_PROGRESS_TONE[eco]} size="sm" shimmer className="mb-4 mx-1" />

          {invasiveThreat && (
            <div className="mb-3 mx-1 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 font-medium">
              外来種が生態系に影響しています — 赤枠の枠に注意
            </div>
          )}

          <Pyramid
            ecosystem={eco}
            discovered={set}
            activeIds={mounted ? activeIds : undefined}
            pwMap={mounted ? pwMap : undefined}
            invasiveThreat={invasiveThreat}
            selectedId={highlightedId}
            onSelect={onTileSelect}
            feedDropTargets={dragFeed ? feedDropTargets : undefined}
            feedHoverId={feedHoverId}
            onFeedHover={setFeedHoverId}
            onFeedDrop={(id) => void onFeedDropOnTile(id)}
          />

          {/* Feed / predation — drag onto pyramid */}
          <div className="mt-4 rounded-2xl bg-neutral-50 border border-neutral-100 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
              <LuUtensils size={15} className="text-forest-600" />
              餌（素材）
              <span className="ml-auto text-xs font-normal text-neutral-400">
                {ecoFeeds.length} 個{totalFeeds > ecoFeeds.length ? `（ほか ${totalFeeds - ecoFeeds.length}）` : ""}
              </span>
            </div>
            {ecoFeeds.length === 0 ? (
              <p className="text-xs text-neutral-400 mt-2">
                {feedsOnOtherTab
                  ? "ほかの生態系タブ（陸・淡水・海洋）に餌があります。タブを切り替えてください。"
                  : "撮影して「図鑑に登録する」まで完了すると、餌が1つもらえます。"}
              </p>
            ) : (
              <div
                className={`flex gap-2 mt-2 no-scrollbar ${dragFeed ? "overflow-hidden" : "overflow-x-auto"}`}
              >
                {ecoFeeds.map((f) => {
                  const src = SPECIES_BY_ID[f.sourceSpeciesId];
                  const targets = validPredatorsForFeed(f, set);
                  const canFeed = targets.length > 0 && f.trophicLevel < 4;
                  const blocked =
                    f.trophicLevel >= 4
                      ? "頂点の餌は使えません"
                      : targets.length === 0
                      ? "上位の生き物を先に発見"
                      : null;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      disabled={!canFeed}
                      draggable={canFeed}
                      onPointerDown={(e) => {
                        if (e.pointerType === "mouse") return;
                        startFeedDrag(f, e);
                      }}
                      onDragStart={(e) => startNativeFeedDrag(f, e)}
                      onDragEnd={endNativeFeedDrag}
                      title={blocked ?? undefined}
                      className={`shrink-0 rounded-xl px-3 py-2 text-left border transition-colors touch-none select-none ${
                        canFeed
                          ? "bg-white text-neutral-700 border-neutral-200 cursor-grab active:cursor-grabbing active:bg-forest-50 active:border-forest-300"
                          : "bg-neutral-100 text-neutral-400 border-neutral-100 opacity-60 cursor-not-allowed"
                      } ${dragFeed?.id === f.id ? "opacity-40 scale-95" : ""}`}
                    >
                      <div className="text-[11px] font-bold truncate max-w-[100px]">{src?.nameJa ?? "餌"}</div>
                      {canFeed ? (
                        <div className="text-[10px] text-forest-600 font-semibold">ドラッグで与える +{f.pwValue}pw</div>
                      ) : (
                        <div className="text-[10px] text-neutral-400">{blocked}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-neutral-400">
            {dragFeed
              ? "上位の生き物の枠にドロップして餌を与えよう"
              : highlightedId
              ? "もう一度タップで詳細を表示"
              : "タップで選択 → もう一度タップで詳細"}
          </p>
        </Card>
      </Screen>

      {dragFeed && dragPos && (
        <div
          className="fixed z-[60] pointer-events-none rounded-xl px-3 py-2 bg-white border-2 border-forest-500 shadow-lg text-left"
          style={{ left: dragPos.x + 12, top: dragPos.y + 12 }}
        >
          <div className="text-[11px] font-bold text-neutral-800">
            {SPECIES_BY_ID[dragFeed.sourceSpeciesId]?.nameJa ?? "餌"}
          </div>
          <div className="text-[10px] text-forest-600 font-semibold">+{dragFeed.pwValue}pw</div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-forest-800 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg animate-fadeIn">
          {toast}
        </div>
      )}

      {sel && sel.found && discoveries[sel.s.id] ? (
        <SpeciesDetailSheet species={sel.s} discovery={discoveries[sel.s.id]} pw={pwMap[sel.s.id]} onClose={() => { setSel(null); setHighlightedId(null); }} />
      ) : sel ? (
        <HintSheet s={sel.s} onClose={() => { setSel(null); setHighlightedId(null); }} />
      ) : null}

      {help && <HelpSheet onClose={() => setHelp(false)} />}
    </div>
  );
}

function HelpSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="relative px-6 pt-6 pb-2">
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
            <LuX size={16} />
          </button>
          <div className="flex items-center gap-2 text-neutral-900">
            <LuInfo size={20} className="text-forest-600" />
            <h2 className="text-lg font-bold">ピラミッドの遊び方</h2>
          </div>
        </div>
        <div className="px-6 pb-7 space-y-3">
          <HelpRow title="食物連鎖を完成させよう" body="各生態系に10種類（1→2→3→4段）の枠があります。撮影で生き物がピラミッドに並び、最初は10pwでスタートします。" />
          <HelpRow title="生命力（pw）" body="毎日1pwずつ減り、0になるとピラミッドから消えます。空いた枠には種類名なしのヒント（カテゴリ・生息環境など）が表示されます。" />
          <HelpRow title="餌で成長" body="撮影のたびに餌（pw）がもらえます。肉食ほど多く、草食ほど少ないです。餌をドラッグして上位の生き物にドロップするとpwが回復します。" />
          <HelpRow title="生命力と大きさ" body="pwが低い個体は小さく、高い個体は大きく表示されます。毎日1pwずつ減っていきます。" />
          <HelpRow title="詳細を見る" body="タップで枠が光って強調されます。もう一度同じ枠をタップすると詳細（未発見はヒント）が開きます。時間をおいてもOKです。" />
          <HelpRow title="外来種に注意" body="外来種は赤枠で表示され、ピラミッドの色調が変わります。報告するとB-mileがもらえます。" />
          <button onClick={onClose} className="w-full mt-2 bg-forest-600 text-white font-bold rounded-xl py-3">とじる</button>
        </div>
      </div>
    </div>
  );
}

function HelpRow({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="text-sm font-bold text-neutral-800">{title}</div>
      <div className="text-sm text-neutral-500 leading-relaxed">{body}</div>
    </div>
  );
}

function HintSheet({ s, onClose }: { s: Species; onClose: () => void }) {
  const info = SPECIES_INFO[s.id];
  const ecoHint = ECO_HINT[s.ecosystem];
  const hint = slotHintFor(s);
  const HintIcon = hint.Icon;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center modal-backdrop" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="relative p-6 text-center">
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
            <LuX size={16} />
          </button>
          <div
            className={`w-20 h-20 mx-auto rounded-2xl border border-dashed border-neutral-300 bg-gradient-to-br ${hint.bgClass} flex flex-col items-center justify-center gap-1`}
          >
            <HintIcon size={28} className={hint.iconClass} />
            <span className={`text-[10px] font-bold ${hint.rarityClass}`}>{hint.rarityLabel}</span>
          </div>
          <div className="mt-3 font-bold text-neutral-800">この枠には誰がいる？</div>
          <div className="text-xs text-neutral-500 mt-1">写真はまだありませんが、ヒントから推測できます</div>
          <div className="text-xs text-neutral-400 mt-1">
            {ECOSYSTEM_LABEL[s.ecosystem]} ・ {s.category} ・ 栄養段階 Lv.{s.trophicLevel}
          </div>
          <div className="mt-4 bg-gold-50 border border-gold-100 rounded-2xl p-4 text-left space-y-2">
            <div className="text-xs font-bold text-gold-600 flex items-center gap-1"><LuLightbulb size={13} /> 撮影ヒント</div>
            <HintLine label="生息環境" value={info?.habitat ?? "野外"} />
            <HintLine label="季節" value={info?.season ?? ecoHint.season} />
            <HintLine label="時間帯" value={info?.timeOfDay ?? ecoHint.time} />
            <HintLine label="県内の傾向" value={info?.regionTrend ?? ecoHint.region} />
            <p className="text-[10px] text-neutral-400 pt-1">※ 具体的な場所や種名の答えは表示しません</p>
          </div>
          <button onClick={onClose} className="w-full mt-4 bg-forest-600 text-white font-bold rounded-xl py-3">さがしに行く</button>
        </div>
      </div>
    </div>
  );
}

function HintLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-neutral-700">
      <span className="text-neutral-400 text-xs">{label}：</span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}
