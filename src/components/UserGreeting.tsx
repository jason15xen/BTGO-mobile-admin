"use client";

import { useEffect, useState } from "react";

/** Shows the registered nickname (from localStorage) once mounted. */
export default function UserGreeting() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("btgo_user");
      if (raw) setName(JSON.parse(raw).name ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  return <span>こんにちは{name ? `、${name}さん` : ""}！</span>;
}
