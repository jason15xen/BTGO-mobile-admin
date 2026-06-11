"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-4">
      <p className="text-forest-800 font-bold text-lg">問題が発生しました</p>
      <p className="text-sm text-neutral-500 max-w-sm">
        {error.message || "ページの読み込みに失敗しました。"}
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-forest-600 text-white font-bold rounded-xl px-6 py-3 active:bg-forest-700"
      >
        再試行
      </button>
    </div>
  );
}
