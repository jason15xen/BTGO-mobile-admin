import "server-only";
import { DEMO_USER } from "@/lib/game";
import { createClient } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  region: string | null;
};

export function isAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Logged-in user from Supabase, or null when guest / auth not configured. */
export async function getCurrentUser(): Promise<AppUser | null> {
  if (!isAuthConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, region")
    .eq("id", user.id)
    .maybeSingle();

  const meta = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? "",
    name:
      profile?.display_name ??
      (typeof meta.display_name === "string" ? meta.display_name : null) ??
      "ユーザー",
    region:
      profile?.region ??
      (typeof meta.region === "string" ? meta.region : null),
  };
}

/** Active user id for game data — authenticated user or demo guest. */
export function resolveUserId(user: AppUser | null): string {
  return user?.id ?? DEMO_USER.id;
}

export function resolveUserName(user: AppUser | null): string {
  return user?.name ?? DEMO_USER.name;
}
