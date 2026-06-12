"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LuLightbulb, LuX, LuInfo, LuUtensils } from "react-icons/lu";
import { slotHintFor } from "@/lib/slotHint";
import Pyramid from "@/components/Pyramid";
import PyramidCelebrationDeck, {
  consumePyramidCelebrationShown,
  consumeViewPyramidAfterComplete,
} from "@/components/PyramidCelebrationDeck";
import { ECOSYSTEM_LABEL } from "@/data/species";
import { SPECIES_INFO } from "@/data/speciesInfo";
import { ECO_THEME } from "@/lib/theme";
import { ensureDemoSessionReady, fetchDemoStateSnapshot, postFeed, postFence } from "@/lib/gameApi";
import type { Ecosystem, FeedItem } from "@/lib/types";
import { PageHero, Screen, Card } from "@/components/ui";
import SpeciesDetailSheet from "@/components/SpeciesDetailSheet";
import type { Discovery } from "@/lib/game";
import type { Species } from "@/lib/types";

const TABS: { key: Ecosystem }[] = [{ key: "terrestrial" }, { key: "freshwater" }, { key: "marine" }];

const ACTIVE_TAB_BG: Record<Ecosystem, string> = {
  terrestrial: "bg-forest-200",
  freshwater: "bg-teal-100",
  marine: "bg-lime-100",
};

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
  demoPyramidLevel = 1,
}: {
  userId: string;
  discovered: string[];
  totals: Record<string, number>;
  discoveries: Record<string, Discovery>;
  demoPyramidLevel?: number;
}) {
  const initialNav = useMemo(() => {
    const hintedLevel = consumeViewPyramidAfterComplete();
    let fromUrl: number | null = null;
    if (typeof window !== "undefined") {
      const lv = Number(new URLSearchParams(window.location.search).get("lv"));
      if (Number.isFinite(lv) && lv > 1) fromUrl = lv;
    }
    const level = hintedLevel ?? fromUrl ?? demoPyramidLevel;
    return {
      level,
      eco: (level > 1 ? "freshwater" : "terrestrial") as Ecosystem,
    };
  }, [demoPyramidLevel]);
  const [eco, setEco] = useState<Ecosystem>(initialNav.eco);
  const [sel, setSel] = useState<{ s: Species; found: boolean } | null>(null);
  const [help, setHelp] = useState(false);
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [foodPw, setFoodPw] = useState(0);
  const [pwMap, setPwMap] = useState<Record<string, number>>({});
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [extinctIds, setExtinctIds] = useState<Set<string>>(new Set());
  const [fencedIds, setFencedIds] = useState<Set<string>>(new Set());
  const [fenceMode, setFenceMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [demoSynced, setDemoSynced] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [dragFeed, setDragFeed] = useState<FeedItem | null>(null);
  const [selectedFood, setSelectedFood] = useState<FeedItem | null>(null);
  const [feedHoverId, setFeedHoverId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<FeedItem | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [demoDiscovered, setDemoDiscovered] = useState<string[]>([]);
  const [pyramidFill, setPyramidFill] = useState<Record<Ecosystem, string[]>>({
    terrestrial: [],
    freshwater: [],
    marine: [],
  });
  const DRAG_THRESHOLD = 8;

  const [invasive, setInvasive] = useState<Record<Ecosystem, boolean>>({
    terrestrial: false,
    freshwater: false,
    marine: false,
  });
  const [level, setLevel] = useState(initialNav.level);
  const [pyramidCelebrating, setPyramidCelebrating] = useState(false);
  const pathname = usePathname();
  const sessionReadyRef = useRef(false);

  /** Filled slots come from server demo script — never from stale game individuals. */
  const pyramidVisibleIds = useMemo(() => {
    if (!demoSynced) return new Set<string>();
    return new Set(pyramidFill[eco] ?? []);
  }, [demoSynced, eco, pyramidFill]);

  const applySnapshot = useCallback((snapshot: NonNullable<Awaited<ReturnType<typeof fetchDemoStateSnapshot>>>) => {
    const { game } = snapshot;
    setDemoDiscovered(snapshot.discovered);
    setPyramidFill(snapshot.pyramidFill);
    setLevel(snapshot.pyramidLevel);
    if (snapshot.pyramidLevel > 1) setEco("freshwater");
    setFeeds(game.feeds);
    setFoodPw(game.foodPw);
    setPwMap(game.pwMap);
    setActiveIds(new Set(game.activeIds));
    setExtinctIds(new Set(game.extinctIds));
    setFencedIds(new Set(game.fencedIds));
    setInvasive(game.invasive);
    if (game.pyramidJustCompleted && !consumePyramidCelebrationShown()) {
      setEco("terrestrial");
      setPyramidCelebrating(true);
    }
    if (game.loginBonus) setToast("🎁 ログインボーナス：みんなの生命力 +1pw！");
  }, []);

  const syncAll = useCallback(async () => {
    const snapshot = await fetchDemoStateSnapshot();
    if (snapshot) applySnapshot(snapshot);
    return snapshot;
  }, [applySnapshot]);

  useEffect(() => {
    if (pathname !== "/pyramid") return;
    let cancelled = false;
    setDemoSynced(false);
    setMounted(false);
    async function init() {
      if (!sessionReadyRef.current) {
        await ensureDemoSessionReady();
        sessionReadyRef.current = true;
      }
      await syncAll();
      if (!cancelled) {
        setMounted(true);
        setDemoSynced(true);
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [pathname, syncAll]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const total = totals[eco] ?? 0;
  const found = demoSynced ? pyramidVisibleIds.size : 0;
  const invasiveThreat = mounted && invasive[eco];
  // Food is generic — every feed can go to any creature, regardless of tab.
  const ecoFeeds = mounted ? feeds : [];
  // Total vitality of the creatures in the current ecosystem (auto-calculated).
  const totalPyramidPw = mounted
    ? Object.entries(pwMap)
        .filter(([id]) => id.startsWith(eco[0] + "-"))
        .reduce((sum, [, v]) => sum + v, 0)
    : 0;

  function onTileSelect(s: Species, activeTile: boolean) {
    // Extinct individual — stays grayed in place; tap explains (spec §3.1).
    if (extinctIds.has(s.id) && !activeIds.has(s.id)) {
      setToast("この個体は消滅しました。再撮影で新しい個体をむかえよう");
      return;
    }
    // Fence mode — tap an invasive creature to isolate it (spec §4.1).
    if (fenceMode) {
      setFenceMode(false);
      if (s.invasive && activeTile && !fencedIds.has(s.id)) {
        void placeFenceOn(s.id);
      } else {
        setToast("保護柵は赤枠の外来種に設置できます");
      }
      return;
    }
    // If a food card is selected, tapping a living pyramid tile feeds it.
    if (selectedFood && activeIds.has(s.id)) {
      const food = selectedFood;
      setSelectedFood(null);
      void dropFeedOn(food, s.id);
      return;
    }
    if (highlightedId === s.id) {
      setHighlightedId(null);
      setSel({ s, found: activeTile });
      return;
    }
    setSel(null);
    setHighlightedId(s.id);
  }

  const discoveredSet = useMemo(() => new Set(demoDiscovered), [demoDiscovered]);

  const feedTargetSet = useMemo(() => {
    if (!mounted || activeIds.size === 0) return new Set<string>();
    return new Set([...activeIds].filter((id) => discoveredSet.has(id)));
  }, [mounted, activeIds, discoveredSet]);

  const feedDropTargets = useMemo(() => {
    if (!selectedFood && !dragFeed) return undefined;
    if (feedTargetSet.size === 0) return undefined;
    return feedTargetSet;
  }, [selectedFood, dragFeed, feedTargetSet]);

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
        setToast("先に生き物を発見しよう");
      } else if (result.reason === "invalid-target") {
        setToast("この生き物には餌を与えられません");
      } else if (result.reason === "no-food") {
        setToast("餌が足りません（撮影して補充しよう）");
      }
      return;
    }
    setFoodPw(result.foodPw);
    setPwMap((prev) => ({ ...prev, [targetSpeciesId]: result.newPw }));
    if (result.recovered) {
      setToast(`💗 ${result.predatorName} が元気になった！ +${result.gained}pw ♪`);
    } else {
      setToast(`${result.predatorName} +${result.gained}pw（残り餌 ${result.foodPw}pw）`);
    }
    await syncAll();
  }

  async function placeFenceOn(speciesId: string) {
    const r = await postFence(speciesId);
    if (!r.ok) {
      setToast(r.reason === "no-bmile" ? "B-mileが足りません" : "保護柵を設置できませんでした");
      return;
    }
    setToast("🛡 保護柵を設置！在来種への影響がやわらぎます（-1 B-mile）");
    void syncAll();
  }

  function startNativeFeedDrag(feed: FeedItem, e: React.DragEvent<HTMLElement>) {
    if (feedTargetSet.size === 0) {
      e.preventDefault();
      return;
    }
    dragRef.current = feed;
    setDragFeed(feed);
    e.dataTransfer.setData("application/feed-id", feed.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function endNativeFeedDrag() {
    // onDragEnd can fire before onDrop — defer clear so drop still has feed context.
    window.setTimeout(() => {
      if (dragRef.current) clearFeedDrag();
    }, 0);
  }

  function resolveFeed(feedId?: string): FeedItem | null {
    return (
      dragRef.current ??
      dragFeed ??
      selectedFood ??
      (feedId ? feeds.find((f) => f.id === feedId) ?? null : null)
    );
  }

  async function onFeedDropOnTile(targetSpeciesId: string, feedId?: string) {
    const feed = resolveFeed(feedId);
    if (!feed) return;
    setSelectedFood(null);
    await dropFeedOn(feed, targetSpeciesId);
    clearFeedDrag();
  }

  function beginPointerFeed(feed: FeedItem, e: React.PointerEvent<HTMLButtonElement>) {
    if (!(mounted && activeIds.size > 0 && foodPw >= feed.pwValue)) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  }

  function movePointerFeed(feed: FeedItem, e: React.PointerEvent<HTMLButtonElement>) {
    const start = pointerStartRef.current;
    if (!start) return;
    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (!dragRef.current && moved < DRAG_THRESHOLD) return;
    if (!dragRef.current) {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = feed;
      setDragFeed(feed);
      document.body.style.touchAction = "none";
      document.body.style.userSelect = "none";
    }
    setDragPos({ x: e.clientX, y: e.clientY });
    setFeedHoverId(speciesAtPoint(e.clientX, e.clientY, feedTargetSet));
  }

  function endPointerFeed(feed: FeedItem, e: React.PointerEvent<HTMLButtonElement>) {
    const dragging = Boolean(dragRef.current);
    if (dragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      const id = speciesAtPoint(e.clientX, e.clientY, feedTargetSet);
      if (id) void dropFeedOn(feed, id);
      clearFeedDrag();
    }
    pointerStartRef.current = null;
  }

  return (
    <div>
      <PageHero
        title="生態系ピラミッド"
        subtitle={`Lv.${level} — 発見した生き物で食物連鎖を完成させよう`}
        gradient={`${ECO_THEME[eco].gradient}`}
        bgImage={`/eco/${eco}.webp`}
        right={
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-white/25 text-white text-xs font-bold rounded-full px-2.5 py-1">
              ピラミッド Lv.{level}
            </span>
            <button
              onClick={() => setHelp(true)}
              aria-label="ヘルプ"
              className="w-9 h-9 rounded-full bg-white/20 active:bg-white/30 flex items-center justify-center text-white"
            >
              <LuInfo size={18} />
            </button>
          </div>
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
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className="text-forest-600">合計 {totalPyramidPw}pw</span>
              <span className="text-neutral-300">|</span>
              <span className={ECO_THEME[eco].text}>{found}/{total}種</span>
            </span>
          </div>
          {invasiveThreat && (
            <div className="mb-3 mx-1 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 font-medium flex items-center gap-2">
              <span className="flex-1">外来種が生態系に影響しています — 在来種の生命力が減りやすくなります</span>
              <button
                onClick={() => setFenceMode((v) => !v)}
                className={`shrink-0 text-[11px] font-bold rounded-full px-2.5 py-1.5 border ${
                  fenceMode ? "bg-sky-600 text-white border-sky-700" : "bg-white text-sky-700 border-sky-300"
                }`}
              >
                🛡 保護柵 (1 B-mile)
              </button>
            </div>
          )}
          {fenceMode && (
            <p className="mb-3 mx-1 text-xs text-sky-700 font-semibold text-center">赤枠の外来種をタップして隔離しよう</p>
          )}

          {!demoSynced ? (
            <div className="py-16 text-center text-sm text-neutral-400">ピラミッドを読み込み中…</div>
          ) : pyramidCelebrating && eco === "terrestrial" ? (
            <PyramidCelebrationDeck
              onComplete={() => {
                setPyramidCelebrating(false);
                setEco("freshwater");
                void syncAll();
                setToast("🎉 ピラミッド完成！+30 B-mile と経験値を獲得");
              }}
            />
          ) : (
            <Pyramid
              ecosystem={eco}
              discovered={pyramidVisibleIds}
              activeIds={pyramidVisibleIds}
              extinctIds={mounted ? extinctIds : undefined}
              fencedIds={mounted ? fencedIds : undefined}
              pwMap={mounted ? pwMap : undefined}
              invasiveThreat={invasiveThreat}
              selectedId={highlightedId}
              onSelect={onTileSelect}
              feedDropTargets={feedDropTargets}
              feedHoverId={feedHoverId}
              onFeedHover={setFeedHoverId}
              onFeedDrop={(id, feedId) => void onFeedDropOnTile(id, feedId)}
            />
          )}

          {/* Feed — 1/3/9 pw cards in one row. Tap a card then a creature (or drag). */}
          <div className="mt-4 rounded-2xl bg-neutral-50 border border-neutral-100 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-700">
              <LuUtensils size={15} className="text-forest-600" />
              餌をあげる
              <span className="ml-auto text-xs font-normal text-neutral-500">
                残り <span className="font-bold text-forest-600">{foodPw}pw</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {ecoFeeds.map((f) => {
                const canFeed = mounted && activeIds.size > 0 && foodPw >= f.pwValue;
                const isSel = selectedFood?.id === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    disabled={!canFeed}
                    draggable={canFeed}
                    onClick={() => setSelectedFood(isSel ? null : f)}
                    onPointerDown={(e) => beginPointerFeed(f, e)}
                    onPointerMove={(e) => movePointerFeed(f, e)}
                    onPointerUp={(e) => endPointerFeed(f, e)}
                    onPointerCancel={(e) => endPointerFeed(f, e)}
                    onDragStart={(e) => startNativeFeedDrag(f, e)}
                    onDragEnd={endNativeFeedDrag}
                    className={`rounded-xl py-2.5 flex flex-col items-center border transition-all select-none ${
                      isSel
                        ? "bg-forest-600 text-white border-forest-700 shadow scale-[1.03]"
                        : canFeed
                        ? "bg-white text-neutral-700 border-neutral-200 active:bg-forest-50 cursor-grab"
                        : "bg-neutral-100 text-neutral-400 border-neutral-100 opacity-60"
                    }`}
                  >
                    <span className="text-xl leading-none">🍃</span>
                    <span className={`text-sm font-extrabold mt-1 ${isSel ? "text-white" : "text-forest-600"}`}>+{f.pwValue}pw</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-500 mt-2 text-center">
              {selectedFood
                ? `「+${selectedFood.pwValue}pw」を与える生き物をタップ`
                : "餌をタップして選び、生き物をタップ"}
            </p>
          </div>

          <p className="mt-3 text-center text-xs text-neutral-400">
            {dragFeed
              ? "生き物の枠にドロップして餌を与えよう"
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
          <div className="text-[11px] font-bold text-neutral-800">🍃 餌</div>
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
          <HelpRow title="生命力（pw）" body="毎日1pwずつ減ります（植物などの生産者は減りません）。0になった個体はグレーで残り、再撮影すると新しい個体が入ります。毎日のログインで全員+1pw。" />
          <HelpRow title="餌で成長" body="餌は 1pw・3pw・9pw の3サイズがあり、どの生き物にも与えられます。ドラッグしてドロップするとpwが加算され、上限なく積み上がります。所持している餌の合計pwは自動で表示されます。" />
          <HelpRow title="生命力と大きさ" body="pwが3〜10は中サイズ、10より大きい個体は大きく、3未満の弱った個体は小さく表示されます。毎日1pwずつ減っていきます。" />
          <HelpRow title="詳細を見る" body="タップで枠が光って強調されます。もう一度同じ枠をタップすると詳細（未発見はヒント）が開きます。時間をおいてもOKです。" />
          <HelpRow title="外来種に注意" body="外来種は赤枠で表示され、同じ段の在来種の生命力が減りやすくなります。保護柵（1 B-mile）で隔離すると影響がやわらぎます。" />
          <HelpRow title="弱った個体を助けよう" body="生命力3未満の弱った個体に餌をあげると回復ボーナス+1pw。元気になって喜びます💗" />
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
