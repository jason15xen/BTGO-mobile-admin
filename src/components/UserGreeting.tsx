"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/** Shows the signed-in nickname, or a generic greeting for guests. */
export default function UserGreeting({ initialName }: { initialName?: string | null }) {
  const [name, setName] = useState<string | null>(initialName ?? null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      if (typeof meta.display_name === "string") {
        setName(meta.display_name);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const meta = session?.user.user_metadata ?? {};
      setName(typeof meta.display_name === "string" ? meta.display_name : null);
    });

    return () => sub.subscription.unsubscribe();
  }, [initialName]);

  return <span>こんにちは{name ? `、${name}さん` : ""}！</span>;
}
