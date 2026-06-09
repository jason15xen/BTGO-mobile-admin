"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const REGIONS = [
  "富士市",
  "富士宮市",
  "富士河口湖町",
  "山中湖村",
  "御殿場市",
  "裾野市",
  "その他",
];

type Mode = "signup" | "login";

export default function AuthClient({ mode: initialMode }: { mode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    region: "富士市",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      return setError("有効なメールアドレスを入力してください。");
    }
    if (form.password.length < 6) {
      return setError("パスワードは6文字以上にしてください。");
    }

    if (mode === "signup") {
      if (!form.name.trim()) return setError("ニックネームを入力してください。");
      if (!form.agree) return setError("利用規約への同意が必要です。");
    }

    if (!isSupabaseConfigured()) {
      return setError(
        "認証サーバーが未設定です。.env.local に Supabase のキーを設定してください。",
      );
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              display_name: form.name.trim(),
              region: form.region,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;

        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          router.push("/");
          router.refresh();
          return;
        }
        setMessage("確認メールを送信しました。メール内のリンクから登録を完了してください。");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "認証に失敗しました。";
      setError(translateAuthError(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-forest-700 to-forest-600 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-white mb-6">
          <Logo size="lg" showTagline inverted className="justify-center" />
          <h1 className="text-xl font-bold mt-4">ようこそ</h1>
          <p className="text-sm text-forest-100 mt-1 text-center">富士の自然を探索する仲間に加わろう</p>
        </div>

        <div className="flex gap-1 rounded-2xl bg-white/15 p-1 mb-4">
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              mode === "signup" ? "bg-white text-forest-800" : "text-white/80"
            }`}
          >
            新規登録
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); setMessage(""); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              mode === "login" ? "bg-white text-forest-800" : "text-white/80"
            }`}
          >
            ログイン
          </button>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <h2 className="font-bold text-forest-900 text-lg">
            {mode === "signup" ? "アカウント作成" : "ログイン"}
          </h2>

          {mode === "signup" && (
            <Field label="ニックネーム">
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="例：ふじやま太郎"
                className="input"
                autoComplete="nickname"
              />
            </Field>
          )}

          <Field label="メールアドレス">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className="input"
              autoComplete="email"
            />
          </Field>

          <Field label="パスワード">
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="6文字以上"
              className="input"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </Field>

          {mode === "signup" && (
            <>
              <Field label="お住まいの地域">
                <select value={form.region} onChange={(e) => update("region", e.target.value)} className="input">
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>

              <label className="flex items-start gap-2 text-sm text-forest-600">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => update("agree", e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-forest-600"
                />
                <span>
                  <span className="text-forest-700 underline">利用規約</span>および
                  <span className="text-forest-700 underline">プライバシーポリシー</span>に同意します
                </span>
              </label>
            </>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {message && <p className="text-sm text-forest-700 bg-forest-50 rounded-lg px-3 py-2">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest-600 active:bg-forest-700 disabled:opacity-60 text-white font-bold rounded-xl py-3.5 border-[1.5px] border-forest-700 btn3d"
          >
            {submitting
              ? "処理中…"
              : mode === "signup"
                ? "登録して始める"
                : "ログイン"}
          </button>

          <p className="text-center text-sm text-forest-400">
            <Link href="/" className="text-forest-700 font-semibold underline">
              ゲストとして続ける
            </Link>
          </p>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1.5px solid #d6e2d9;
          border-radius: 0.75rem;
          padding: 0.7rem 0.9rem;
          font-size: 0.95rem;
          background: #f4f8f5;
          outline: none;
          box-shadow: inset 0 2px 4px rgba(16,28,22,0.10), inset 0 -1px 0 rgba(255,255,255,0.6);
        }
        .input:focus { border-color: #3f7d49; background: #fff; box-shadow: inset 0 2px 4px rgba(16,28,22,0.08), 0 0 0 3px rgba(63,125,73,0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-forest-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "メールアドレスまたはパスワードが正しくありません。";
  if (msg.includes("User already registered")) return "このメールアドレスは既に登録されています。";
  if (msg.includes("Email not confirmed")) return "メールアドレスの確認が完了していません。";
  return msg;
}
