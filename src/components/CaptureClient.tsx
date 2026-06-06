"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SPECIES, ECOSYSTEM_LABEL } from "@/data/species";
import { SPECIES_INFO } from "@/data/speciesInfo";
import { ECO_THEME } from "@/lib/theme";
import { rewardFor } from "@/lib/game";
import type { Species } from "@/lib/types";
import Pyramid from "@/components/Pyramid";
import SpeciesImage from "@/components/SpeciesImage";
import { useImmersive } from "@/components/AppShell";
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
  const [isNew, setIsNew] = useState(false);

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

  // AI analyzing progress.
  useEffect(() => {
    if (phase !== "analyzing") return;
    setProgress(0);
    const iv = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 7, 100);
        if (next >= 100) {
          clearInterval(iv);
          setSubject(randomSpecies());
          setPhase("result");
        }
        return next;
      });
    }, 80);
    return () => clearInterval(iv);
  }, [phase]);

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
        body: JSON.stringify({ speciesId: subject.id }),
      });
      const data = await res.json().catch(() => ({}));
      setReward(data.reward ?? rewardFor(subject));
      setIsNew(data.isNewSpecies ?? true);
      setDiscovered(new Set<string>(data.myDiscovered ?? [subject.id]));
      setPhase("reflection");
    } catch {
      // Network/server failure — still show the reflection with local values.
      setReward(rewardFor(subject));
      setIsNew(true);
      setDiscovered(new Set<string>([subject.id]));
      setPhase("reflection");
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
            disabled={camError || !camReady}
            aria-label="シャッター"
            className="w-[76px] h-[76px] rounded-full bg-white ring-4 ring-white/30 disabled:opacity-40 active:scale-95 transition-transform"
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
          <div className="absolute inset-0 bg-black/30" />
          {/* scan line (driven by progress) */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-aqua-300 to-transparent shadow-[0_0_12px_rgba(95,217,208,0.8)] transition-all" style={{ top: `${progress}%` }} />
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
            <div className="text-center font-semibold">AIが解析中…</div>
            <div className="text-center text-xs text-white/70 mb-2">生態系データベースと照合しています</div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-aqua-400 to-forest-400 transition-all" style={{ width: `${progress}%` }} />
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
  const rw = rewardFor(subject);

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
              <SpeciesImage speciesId={subject.id} emoji={subject.emoji} alt={subject.nameJa} className="w-full h-full" />
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
  return (
    <div className="min-h-full bg-neutral-50 pb-6">
      <div className={`bg-gradient-to-r ${theme.gradient} text-white px-5 pt-6 pb-8 text-center`}>
        <LuPartyPopper size={30} className="mx-auto" />
        <h1 className="font-bold text-lg mt-1">ピラミッドに反映されました！</h1>
        <p className="text-xs opacity-90 mt-1">あなたの発見が生態系のつながりを強化しました</p>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        <div className="card3d rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <SpeciesImage speciesId={subject.id} emoji={subject.emoji} alt={subject.nameJa} className="w-12 h-12" rounded="rounded-full ring-2 ring-gold-400" />
            <div>
              <div className="font-bold text-neutral-800">{subject.nameJa}</div>
              <div className="text-xs text-neutral-400">{ECOSYSTEM_LABEL[subject.ecosystem]} ピラミッドに追加{isNew && " ・ 新種！"}</div>
            </div>
          </div>
          <Pyramid ecosystem={subject.ecosystem} discovered={discovered} highlightId={subject.id} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="獲得B-mile" value={`+${reward?.points ?? 0}`} />
          <Stat label="獲得XP" value={`+${reward?.xp ?? 0}`} />
          <Stat label="登録種数" value={`${discovered.size}`} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => router.push("/encyclopedia")} className="bg-white border-[1.5px] border-neutral-200 text-neutral-700 font-semibold rounded-2xl py-3.5">
            図鑑で確認
          </button>
          <button onClick={() => { router.push("/"); router.refresh(); }} className={`bg-gradient-to-r ${theme.gradient} text-white font-bold rounded-2xl py-3.5 border-[1.5px] border-white/25 btn3d`}>
            ホームに戻る
          </button>
        </div>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card3d rounded-2xl p-3 text-center">
      <div className="text-lg font-extrabold text-forest-700">{value}</div>
      <div className="text-[10px] text-neutral-400 mt-0.5">{label}</div>
    </div>
  );
}
