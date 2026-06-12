"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SPECIES, ECOSYSTEM_LABEL, SPECIES_BY_ID } from "@/data/species";
import { SPECIES_INFO } from "@/data/speciesInfo";
import { ECO_THEME } from "@/lib/theme";
import { rewardForCapture } from "@/lib/game";
import type { Species } from "@/lib/types";
import Pyramid from "@/components/Pyramid";
import PyramidCelebrationDeck, {
  markPyramidCelebrationShown,
  markViewPyramidAfterComplete,
} from "@/components/PyramidCelebrationDeck";
import SpeciesImage from "@/components/SpeciesImage";
import { useImmersive } from "@/components/AppShell";
import { ensureDemoSessionReady, fetchDemoCaptureState } from "@/lib/gameApi";
import type { IconType } from "react-icons";
import { FiX, FiZap, FiImage, FiCamera, FiMapPin, FiTag, FiBarChart2, FiAlertTriangle, FiBookOpen, FiChevronLeft } from "react-icons/fi";
import { LuUtensils, LuPartyPopper, LuSwitchCamera } from "react-icons/lu";

type Phase = "camera" | "analyzing" | "result" | "saving" | "reflection";

// Weight selection toward lower trophic levels (more common encounters).
const POOL = SPECIES.flatMap((s) => Array(5 - s.trophicLevel).fill(s)) as Species[];
const randomSpecies = () => POOL[Math.floor(Math.random() * POOL.length)];

export default function CaptureClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("camera");
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);
  const [camReason, setCamReason] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [shot, setShot] = useState<string | null>(null); // user's captured photo (dataURL)
  const [subject, setSubject] = useState<Species | null>(null);
  const [progress, setProgress] = useState(0);
  const [reward, setReward] = useState<{ xp: number; points: number } | null>(null);
  const [discovered, setDiscovered] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState("u-demo");
  const [isNew, setIsNew] = useState(false);
  const [feedGain, setFeedGain] = useState<number | null>(null);
  const [feedOnly, setFeedOnly] = useState(false);
  const [alreadyDiscovered, setAlreadyDiscovered] = useState(false);
  const [pyramidComplete, setPyramidComplete] = useState(false);
  const [demoPyramidLevel, setDemoPyramidLevel] = useState(1);
  const [scriptedSpeciesId, setScriptedSpeciesId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(true);

  const setImmersive = useImmersive();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Hide the bottom nav only while the camera is live; show it on result/reflection.
  useEffect(() => {
    setImmersive(phase === "camera" || phase === "analyzing");
  }, [phase, setImmersive]);
  useEffect(() => () => setImmersive(false), [setImmersive]);

  // Start the device camera.
  useEffect(() => {
    if (phase !== "camera") return;
    let cancelled = false;
    setCamError(false);
    setCamReady(false);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            window.isSecureContext
              ? "このブラウザはカメラに対応していません。"
              : "カメラはhttps（またはlocalhost）でのみ利用できます。"
          );
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCamReady(true);
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        const reason =
          err.name === "NotAllowedError"
            ? "カメラへのアクセスが拒否されました。ブラウザの設定で許可してください。"
            : err.name === "NotFoundError"
            ? "カメラが見つかりませんでした。"
            : err.name === "NotReadableError"
            ? "カメラが他のアプリで使用中です。"
            : err.message || "カメラを起動できませんでした。";
        setCamReason(reason);
        setCamError(true);
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [phase, attempt, facing, stopCamera]);

  useEffect(() => stopCamera, [stopCamera]);

  const applyDemoState = useCallback((demo: NonNullable<Awaited<ReturnType<typeof fetchDemoCaptureState>>>) => {
    setDiscovered(new Set(demo.discovered));
    setDemoPyramidLevel(demo.pyramidLevel);
    setScriptedSpeciesId(demo.nextCapture?.speciesId ?? null);
    setDemoMode(Boolean(demo.nextCapture));
  }, []);

  const syncDemoFromServer = useCallback(async () => {
    const demo = await fetchDemoCaptureState();
    if (demo) applyDemoState(demo);
    return demo;
  }, [applyDemoState]);

  useEffect(() => {
    async function init() {
      await ensureDemoSessionReady();
      await syncDemoFromServer();
    }
    void init();
  }, [syncDemoFromServer]);

  useEffect(() => {
    if (phase !== "camera") return;
    void syncDemoFromServer();
  }, [phase, syncDemoFromServer]);

  function continueCapture() {
    setSubject(null);
    setShot(null);
    setPyramidComplete(false);
    setFeedOnly(false);
    setAlreadyDiscovered(false);
    setFeedGain(null);
    setReward(null);
    setPhase("camera");
  }

  // AI analyzing progress.
  useEffect(() => {
    if (phase !== "analyzing") return;
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 7, 100);
        if (next >= 100) {
          clearInterval(iv);
          // Preview the next scripted slot (server decides the real species on
          // register). Falls back to a random creature once the demo is done.
          const predicted = scriptedSpeciesId ? SPECIES_BY_ID[scriptedSpeciesId] : undefined;
          setSubject(predicted ?? randomSpecies());
          setPhase("result");
        }
        return next;
      });
    }, 80);
    return () => clearInterval(iv);
  }, [phase, scriptedSpeciesId]);

  function takeFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth) {
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
        setShot(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
    stopCamera();
    setPhase("analyzing");
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (demoMode && !scriptedSpeciesId) return;
    const reader = new FileReader();
    reader.onload = () => {
      setShot(typeof reader.result === "string" ? reader.result : null);
      stopCamera();
      setPhase("analyzing");
    };
    reader.readAsDataURL(file);
  }

  async function register() {
    if (!subject) return;
    setPhase("saving");
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speciesId: subject.id, photoData: shot ?? undefined }),
      });
      const data = await res.json().catch(() => ({}));
      // No order enforcement: only a genuine error or a finished demo lands here.
      if (!res.ok || data.done) {
        await syncDemoFromServer();
        setPhase("camera");
        return;
      }
      // The server is authoritative about which creature was recognized.
      const recognized = data.recognizedSpeciesId
        ? SPECIES_BY_ID[data.recognizedSpeciesId as string] ?? subject
        : subject;
      setSubject(recognized);
      const guessedNew = !discovered.has(recognized.id);
      setUserId(data.userId ?? userId);
      setReward(data.reward ?? rewardForCapture(recognized, guessedNew));
      setIsNew(data.isNewSpecies ?? guessedNew);
      setFeedGain(data.feed?.pwValue ?? null);
      setFeedOnly(Boolean(data.feedOnly));
      setAlreadyDiscovered(Boolean(data.alreadyDiscovered));
      setPyramidComplete(Boolean(data.pyramidComplete));
      if (data.pyramidComplete) markPyramidCelebrationShown();
      if (data.demoPyramidLevel) setDemoPyramidLevel(data.demoPyramidLevel);
      setDiscovered(new Set<string>(data.myDiscovered ?? [...discovered, recognized.id]));
      setScriptedSpeciesId(data.demo?.nextCapture?.speciesId ?? null);
      setDemoMode(Boolean(data.demo?.nextCapture));
      setPhase("reflection");
    } catch {
      setPhase("result");
    }
  }

  // ---------------- CAMERA ----------------
  if (phase === "camera") {
    return (
      <div className="min-h-full flex flex-col bg-black text-white">
        <header className="flex items-center justify-between px-5 py-3 z-10">
          <button onClick={() => router.push("/")} aria-label="閉じる">
            <FiX size={24} />
          </button>
          <span className="font-semibold">いきもの撮影</span>
          <span className="w-6" />
        </header>

        <div className="flex-1 relative overflow-hidden mx-4 rounded-3xl bg-neutral-900">
          {!camError ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
              <FiCamera size={44} className="text-white/80" />
              <p className="text-sm text-white/80">{camReason}</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-1 bg-white text-black font-bold rounded-full px-6 py-3 flex items-center gap-2"
              >
                <FiCamera size={18} /> 写真を撮る / 選ぶ
              </button>
              <button onClick={() => setAttempt((a) => a + 1)} className="text-xs text-white/70 underline">
                カメラをもう一度試す
              </button>
            </div>
          )}

          {/* framing guide */}
          {!camError && (
            <>
              <div className="absolute inset-8 border-2 border-white/70 rounded-2xl pointer-events-none" />
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs bg-black/40 rounded-full px-3 py-1">
                いきものを枠に合わせてシャッターを押そう
              </div>
              {!camReady && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                  カメラを起動中…
                </div>
              )}
            </>
          )}
        </div>

        {/* shutter row */}
        <div className="flex items-center justify-around py-7">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-white/80 flex flex-col items-center gap-1"
          >
            <FiImage size={20} /><span>アルバム</span>
          </button>
          <button
            onClick={takeFrame}
            disabled={camError || !camReady || (demoMode && !scriptedSpeciesId)}
            aria-label="シャッター"
            className={`w-[76px] h-[76px] rounded-full bg-white ring-4 ring-white/30 disabled:opacity-40 active:scale-90 transition-transform ${camReady ? "celebrate-ring" : ""}`}
          />
          <button
            onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
            disabled={camError}
            className="text-xs text-white/80 disabled:opacity-40 flex flex-col items-center gap-1"
          >
            <LuSwitchCamera size={20} />
            <span>切替</span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // ---------------- ANALYZING ----------------
  if (phase === "analyzing") {
    return (
      <div className="min-h-full flex flex-col bg-black text-white">
        <div className="flex-1 relative overflow-hidden mx-4 my-4 rounded-3xl">
          {shot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shot} alt="撮影画像" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/30 scan-grid" />
          {/* scan line (driven by progress) */}
          <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-aqua-300 to-transparent shadow-[0_0_16px_rgba(95,217,208,0.9)] transition-all animate-scanPulse" style={{ top: `${progress}%` }} />
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-center font-semibold animate-pulse">AIが解析中…</div>
            <div className="text-center text-xs text-white/70 mb-2">生態系データベースと照合しています</div>
            <div className="progress-track3d progress-track3d--glass h-2 rounded-full">
              <div
                className="progress-fill3d progress-fill-shimmer transition-all duration-150"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(180deg, #5eead4 0%, #37a626 50%, #0d9488 100%)",
                }}
              />
            </div>
            <div className="text-right text-xs mt-1">{progress}%</div>
          </div>
        </div>
      </div>
    );
  }

  if (!subject) return null;
  const theme = ECO_THEME[subject.ecosystem];
  const info = SPECIES_INFO[subject.id];
  const guessedNew = !discovered.has(subject.id);
  const rw = rewardForCapture(subject, guessedNew);

  // ---------------- RESULT (designated organism + info) ----------------
  if (phase === "result" || phase === "saving") {
    return (
      <div className="min-h-full bg-neutral-50 pb-6">
        {/* header */}
        <header className="flex items-center justify-between px-5 py-3">
          <button onClick={() => { setSubject(null); setShot(null); setPhase("camera"); }} aria-label="戻る" className="text-neutral-600">
            <FiChevronLeft size={24} />
          </button>
          <span className="font-semibold text-neutral-800">解析結果</span>
          <span className="w-6" />
        </header>

        {/* main photo */}
        <div className="px-5">
          <div className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-[0_16px_30px_-12px_rgba(16,28,22,0.45)]">
            <div className="aspect-[4/3]">
              <SpeciesImage speciesId={subject.id} emoji={subject.emoji} alt={subject.nameJa} className="w-full h-full" rounded="rounded-3xl" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-neutral-400 flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${theme.chip}`}><theme.Icon size={11} /> {theme.name}</span>
              AIが判定しました
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">{subject.nameJa}</h1>
            <p className="text-sm italic text-neutral-400">{subject.nameSci}</p>
          </div>
        </div>

        <div className="px-5 mt-4 space-y-4">
          {/* reward */}
          <div className="card3d rounded-2xl p-4 flex items-center justify-around">
            <Reward label="経験値" value={`+${rw.xp}`} cls="text-forest-600" />
            <div className="w-px h-8 bg-neutral-100" />
            <Reward label="B-mile" value={`+${rw.points}`} cls="text-gold-500" />
            {subject.invasive && (
              <>
                <div className="w-px h-8 bg-neutral-100" />
                <Reward label="外来種報告" value={<FiAlertTriangle className="mx-auto" size={20} />} cls="text-coral-500" />
              </>
            )}
          </div>
          {!guessedNew && <p className="text-center text-[11px] text-neutral-400">再撮影 — 少量のB-mile</p>}

          {/* specific information */}
          <div className="card3d rounded-2xl p-5 space-y-3">
            <h2 className="font-bold text-neutral-800 flex items-center gap-2">
              <span className={`w-1.5 h-4 rounded-full ${theme.solid}`} />
              この生き物について
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">{info?.description}</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Info Icon={FiMapPin} label="生息地" value={info?.habitat ?? "—"} />
              <Info Icon={LuUtensils} label="主な食べ物" value={info?.diet ?? "—"} />
              <Info Icon={FiTag} label="分類" value={subject.category} />
              <Info Icon={FiBarChart2} label="栄養段階" value={`レベル ${subject.trophicLevel} / 4`} />
            </div>
          </div>

          <button
            onClick={register}
            disabled={phase === "saving"}
            className={`w-full bg-gradient-to-r ${theme.gradient} disabled:opacity-60 text-white font-bold rounded-2xl py-4 border-[1.5px] border-white/25 btn3d`}
          >
            {phase === "saving" ? (
              "登録中…"
            ) : (
              <span className="flex items-center justify-center gap-2"><FiBookOpen size={18} /> 図鑑に登録する</span>
            )}
          </button>
          <button
            onClick={() => { setSubject(null); setShot(null); setPhase("camera"); }}
            className="w-full text-neutral-500 font-medium py-2"
          >
            もう一度撮影する
          </button>
        </div>
      </div>
    );
  }

  // ---------------- REFLECTION ----------------
  if (pyramidComplete && subject) {
    return (
      <PyramidCompleteScreen
        subject={subject}
        level={demoPyramidLevel}
        reward={reward}
        onViewPyramid={() => {
          markViewPyramidAfterComplete(demoPyramidLevel);
          router.push(`/pyramid?lv=${demoPyramidLevel}`);
        }}
        onContinueCapture={continueCapture}
      />
    );
  }

  return (
    <div className="min-h-full bg-neutral-50 pb-6">
      <div className={`bg-gradient-to-r ${theme.gradient} text-white px-5 pt-6 pb-8 text-center animate-fadeIn`}>
        {feedOnly ? (
          <LuUtensils size={30} className="mx-auto" />
        ) : (
          <LuPartyPopper size={30} className="mx-auto animate-wiggle" />
        )}
        <h1 className="font-bold text-lg mt-1 opacity-0-start animate-fadeUp stagger-1">
          {alreadyDiscovered
            ? "この個体はすでに発見されています"
            : feedOnly
            ? "餌（素材）を獲得！"
            : "ピラミッドに反映されました！"}
        </h1>
        <p className="text-xs mt-1 opacity-0-start animate-fadeUp stagger-2">
          {alreadyDiscovered
            ? "餌だけが追加されました。ピラミッドの個体数は増えません"
            : feedOnly
            ? "餌として使えます"
            : "あなたの発見が生態系のつながりを強化しました（生命力 10pw）"}
        </p>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        <div className="card3d rounded-2xl p-4 opacity-0-start animate-scaleIn stagger-3">
          <div className="flex items-center gap-3 mb-3">
            <SpeciesImage speciesId={subject.id} emoji={subject.emoji} alt={subject.nameJa} className="w-12 h-12 ring-2 ring-gold-400" rounded="rounded-full" />
            <div>
              <div className="font-bold text-neutral-800">{subject.nameJa}</div>
              <div className="text-xs text-neutral-400">
                {alreadyDiscovered
                  ? `${ECOSYSTEM_LABEL[subject.ecosystem]} — 再発見（餌のみ）`
                  : feedOnly
                  ? `${ECOSYSTEM_LABEL[subject.ecosystem]} — 餌のみ`
                  : `${ECOSYSTEM_LABEL[subject.ecosystem]} ピラミッドに追加${isNew ? " ・ 新種！" : ""}`}
              </div>
            </div>
          </div>
          {!feedOnly && !alreadyDiscovered && (
            <Pyramid
              ecosystem={subject.ecosystem}
              discovered={discovered}
              activeIds={new Set([...discovered, subject.id])}
              pwMap={{ [subject.id]: 10 }}
              highlightId={subject.id}
              embedded
            />
          )}
          {(feedOnly || alreadyDiscovered) && (
            <div className="rounded-xl bg-gold-50 border border-gold-100 p-4 text-center">
              <div className="text-2xl">🍃</div>
              <p className="text-sm font-bold text-gold-700 mt-1">+{feedGain ?? 0}pw の餌</p>
              <p className="text-xs text-neutral-500 mt-1">
                {alreadyDiscovered ? "すでに発見済みの個体 — 餌のみ追加" : "ピラミッド画面で生き物に与えられます"}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="獲得B-mile" value={`+${reward?.points ?? 0}`} className="stagger-4" />
          <Stat label="獲得XP" value={`+${reward?.xp ?? 0}`} className="stagger-5" />
          <Stat label="餌（素材）" value={feedGain ? `+${feedGain}pw` : "—"} className="stagger-6" />
          <Stat label="ピラミッド" value={feedOnly ? "餌のみ" : `${discovered.size}/10`} className="stagger-6" />
        </div>
        {demoMode && scriptedSpeciesId && (
          <p className="text-xs text-center text-forest-600 font-medium">
            デモ：あと {scriptedSpeciesId ? "撮影を続けてピラミッドを完成させよう" : "完了"}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 opacity-0-start animate-fadeUp stagger-6">
          <button onClick={() => router.push("/pyramid")} className="bg-white border-[1.5px] border-neutral-200 text-neutral-700 font-semibold rounded-2xl py-3.5">
            ピラミッド
          </button>
          <button
            onClick={continueCapture}
            className={`bg-gradient-to-r ${theme.gradient} text-white font-bold rounded-2xl py-3.5 border-[1.5px] border-white/25 btn3d`}
          >
            続けて撮影
          </button>
        </div>
      </div>
    </div>
  );
}

function PyramidCompleteScreen({
  subject,
  level,
  reward,
  onViewPyramid,
  onContinueCapture,
}: {
  subject: Species;
  level: number;
  reward: { xp: number; points: number } | null;
  onViewPyramid: () => void;
  onContinueCapture: () => void;
}) {
  const [celebrationDone, setCelebrationDone] = useState(false);

  return (
    <div className="min-h-full bg-neutral-50 pb-6">
      <div className="bg-gradient-to-r from-gold-400 via-amber-500 to-forest-600 text-white px-5 pt-8 pb-10 text-center animate-fadeIn">
        <LuPartyPopper size={36} className="mx-auto animate-wiggle" />
        <h1 className="font-bold text-xl mt-2 animate-fadeUp">ピラミッド完成！</h1>
        <p className="text-sm mt-2 opacity-90 animate-fadeUp stagger-1">
          {celebrationDone
            ? `食物連鎖がつながりました — ピラミッド Lv.${level}`
            : `${subject.nameJa} で10種が揃いました！`}
        </p>
      </div>
      <div className="px-5 -mt-4 space-y-4">
        <div className="card3d rounded-2xl p-4 animate-scaleIn">
          <PyramidCelebrationDeck embedded onComplete={() => setCelebrationDone(true)} />
        </div>
        <div
          className={`grid grid-cols-2 gap-3 transition-opacity duration-500 ${
            celebrationDone ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Stat label="獲得B-mile" value={`+${reward?.points ?? 30}`} className="stagger-4" />
          <Stat label="獲得XP" value={`+${reward?.xp ?? 150}`} className="stagger-5" />
        </div>
        <div
          className={`grid grid-cols-2 gap-3 transition-opacity duration-500 ${
            celebrationDone ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={onViewPyramid}
            className="bg-white border-[1.5px] border-neutral-200 text-neutral-700 font-semibold rounded-2xl py-4"
          >
            ピラミッドを見る
          </button>
          <button
            type="button"
            onClick={onContinueCapture}
            className="bg-forest-600 text-white font-bold rounded-2xl py-4 btn3d"
          >
            続けて撮影
          </button>
        </div>
        {!celebrationDone && (
          <p className="text-center text-xs text-neutral-400">お祝い演出中…</p>
        )}
      </div>
    </div>
  );
}

function Reward({ label, value, cls }: { label: string; value: React.ReactNode; cls: string }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-extrabold ${cls}`}>{value}</div>
      <div className="text-[11px] text-neutral-400">{label}</div>
    </div>
  );
}

function Info({ Icon, label, value }: { Icon: IconType; label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-3 well3d">
      <div className="text-[11px] text-neutral-400 flex items-center gap-1"><Icon size={12} /> {label}</div>
      <div className="text-sm font-semibold text-neutral-700 mt-0.5">{value}</div>
    </div>
  );
}

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`card3d rounded-2xl p-3 text-center opacity-0-start animate-popIn ${className}`}>
      <div className="text-lg font-extrabold text-forest-700">{value}</div>
      <div className="text-[10px] text-neutral-400 mt-0.5">{label}</div>
    </div>
  );
}
