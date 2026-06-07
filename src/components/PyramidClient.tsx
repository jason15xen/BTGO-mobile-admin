"use client";

import { useState } from "react";
import { LuLightbulb, LuX, LuInfo } from "react-icons/lu";
import Pyramid from "@/components/Pyramid";
import { ECOSYSTEM_LABEL } from "@/data/species";
import { SPECIES_INFO } from "@/data/speciesInfo";
import { ECO_THEME } from "@/lib/theme";
import { PageHero, Screen, Card } from "@/components/ui";
import SpeciesDetailSheet from "@/components/SpeciesDetailSheet";
import type { Discovery } from "@/lib/game";
import type { Ecosystem, Species } from "@/lib/types";

const TABS: { key: Ecosystem }[] = [{ key: "terrestrial" }, { key: "freshwater" }, { key: "marine" }];

const ACTIVE_TAB_BG: Record<Ecosystem, string> = {
  terrestrial: "bg-forest-200",
  freshwater: "bg-teal-100",
  marine: "bg-lime-100",
};

export default function PyramidClient({
  discovered,
  totals,
  discoveries,
}: {
  discovered: string[];
  totals: Record<string, number>;
  discoveries: Record<string, Discovery>;
}) {
  const [eco, setEco] = useState<Ecosystem>("terrestrial");
  const [sel, setSel] = useState<{ s: Species; found: boolean } | null>(null);
  const [help, setHelp] = useState(false);
  const set = new Set(discovered);

  const total = totals[eco] ?? 0;
  const found = discovered.filter((id) => id.startsWith(eco[0] + "-")).length;
  const pct = total ? Math.round((found / total) * 100) : 0;

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
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shrink-0"
          >
            <LuInfo size={18} />
          </button>
        }
      />
      <Screen>
        {/* Ecosystem segmented control */}
        <div className="relative z-10 -mt-6 flex gap-1 rounded-2xl bg-white p-1 ring-1 ring-black/5 shadow-md">
          {TABS.map((t) => {
            const Icon = ECO_THEME[t.key].Icon;
            const activeTab = eco === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setEco(t.key)}
                className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-900 transition-colors ${
                  activeTab ? ACTIVE_TAB_BG[t.key] : "bg-white hover:bg-neutral-50"
                }`}
              >
                <Icon size={16} />
                {ECOSYSTEM_LABEL[t.key]}
              </button>
            );
          })}
        </div>

        {/* Pyramid */}
        <Card className="!p-4 sm:!p-5">
          {/* completion */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-semibold text-neutral-700">{ECOSYSTEM_LABEL[eco]}の食物連鎖</span>
            <span className={`text-sm font-bold ${ECO_THEME[eco].text}`}>{found}/{total} 種 ・ {pct}%</span>
          </div>
          <div className="h-1.5 mb-4 mx-1 bg-neutral-100 rounded-full overflow-hidden well3d">
            <div className={`h-full rounded-full ${ECO_THEME[eco].solid}`} style={{ width: `${pct}%` }} />
          </div>

          <Pyramid ecosystem={eco} discovered={set} onSelect={(s, f) => setSel({ s, found: f })} />

          <p className="mt-3 text-center text-xs text-neutral-400">生き物をタップして詳細を見る</p>
        </Card>
      </Screen>

      {/* detail (found) or hint (undiscovered) */}
      {sel && sel.found && discoveries[sel.s.id] ? (
        <SpeciesDetailSheet species={sel.s} discovery={discoveries[sel.s.id]} onClose={() => setSel(null)} />
      ) : sel ? (
        <HintSheet s={sel.s} onClose={() => setSel(null)} />
      ) : null}

      {/* help sheet */}
      {help && <HelpSheet onClose={() => setHelp(false)} />}
    </div>
  );
}

function HelpSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
          <HelpRow icon="🔺" title="食物連鎖を完成させよう" body="各生態系に10種類（1→2→3→4段）の枠があります。発見した生き物がピラミッドに並びます。" />
          <HelpRow icon="👆" title="タップで詳細" body="並んだ生き物をタップすると、生息地・食べ物などの情報が見られます。" />
          <HelpRow icon="❓" title="シルエットはヒント" body="まだ発見していない枠をタップすると、その生き物を探すヒントが表示されます。" />
          <HelpRow icon="🏆" title="コンプリートボーナス" body="すべての枠をうめると「ピラミッドコンプリート」ボーナス +20 B-mile がもらえます。" />
          <button onClick={onClose} className="w-full mt-2 bg-forest-600 text-white font-bold rounded-xl py-3">とじる</button>
        </div>
      </div>
    </div>
  );
}

function HelpRow({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl shrink-0">{icon}</span>
      <div>
        <div className="text-sm font-bold text-neutral-800">{title}</div>
        <div className="text-sm text-neutral-500 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

function HintSheet({ s, onClose }: { s: Species; onClose: () => void }) {
  const info = SPECIES_INFO[s.id];
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-[440px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative p-6 text-center">
          <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
            <LuX size={16} />
          </button>
          <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 border border-dashed border-neutral-300 flex items-center justify-center text-3xl text-neutral-300">？</div>
          <div className="mt-3 font-bold text-neutral-800">まだ発見していない生き物</div>
          <div className="text-xs text-neutral-400">{ECOSYSTEM_LABEL[s.ecosystem]} ・ 栄養段階 Lv.{s.trophicLevel}</div>
          <div className="mt-4 bg-gold-50 border border-gold-100 rounded-2xl p-4 text-left">
            <div className="text-xs font-bold text-gold-600 flex items-center gap-1"><LuLightbulb size={13} /> ヒント</div>
            <p className="text-sm text-neutral-700 mt-1">こんな所をさがそう：<span className="font-semibold">{info?.habitat ?? "野外"}</span></p>
          </div>
          <button onClick={onClose} className="w-full mt-4 bg-forest-600 text-white font-bold rounded-xl py-3">さがしに行く</button>
        </div>
      </div>
    </div>
  );
}
