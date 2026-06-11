"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="font-sans bg-forest-50 text-forest-900">
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-4">
          <p className="font-bold text-lg">問題が発生しました</p>
          <p className="text-sm text-neutral-600 max-w-sm">
            {error.message || "アプリの読み込みに失敗しました。"}
          </p>
          <button
            type="button"
            onClick={reset}
            className="bg-forest-600 text-white font-bold rounded-xl px-6 py-3"
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
