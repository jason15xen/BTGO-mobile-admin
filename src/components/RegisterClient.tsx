"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LuLeaf } from "react-icons/lu";

const REGIONS = [
  "富士市",
  "富士宮市",
  "富士河口湖町",
  "山中湖村",
  "御殿場市",
  "裾野市",
  "その他",
];

export default function RegisterClient() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", region: "富士市", agree: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("ニックネームを入力してください。");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setError("有効なメールアドレスを入力してください。");
    if (form.password.length < 6) return setError("パスワードは6文字以上にしてください。");
    if (!form.agree) return setError("利用規約への同意が必要です。");

    setSubmitting(true);
    try {
      // PoC: persist a local profile (no real backend auth).
      localStorage.setItem(
        "btgo_user",
        JSON.stringify({ name: form.name.trim(), email: form.email, region: form.region, joinedAt: new Date().toISOString() })
      );
    } catch {
      /* ignore storage errors */
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-forest-700 to-forest-600 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center text-white mb-6">
          <LuLeaf size={40} className="mx-auto" />
          <h1 className="text-2xl font-bold mt-2">BTGO へようこそ</h1>
          <p className="text-sm text-forest-100 mt-1">富士の自然を探索する仲間に加わろう</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          <h2 className="font-bold text-forest-900 text-lg">新規登録</h2>

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
              autoComplete="new-password"
            />
          </Field>

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

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-forest-600 hover:bg-forest-700 disabled:opacity-60 text-white font-bold rounded-xl py-3.5 transition-colors"
          >
            {submitting ? "登録中…" : "登録して始める"}
          </button>

          <p className="text-center text-sm text-forest-400">
            すでにアカウントをお持ちですか？{" "}
            <Link href="/" className="text-forest-700 font-semibold underline">
              スキップ
            </Link>
          </p>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #dcebde;
          border-radius: 0.75rem;
          padding: 0.7rem 0.9rem;
          font-size: 0.95rem;
          background: #f8fbf9;
          outline: none;
        }
        .input:focus { border-color: #3f7d49; background: #fff; box-shadow: 0 0 0 3px rgba(63,125,73,0.12); }
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
